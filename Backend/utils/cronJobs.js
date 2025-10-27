import prisma from "../utils/prismaClient.js";
import { DateTime } from "luxon";
import ejs from "ejs";
import { sendEmail } from "./mailer.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executeCron = async () => {
  try {
    const now = DateTime.utc().toJSDate();

    const dueReminders = await prisma.taskReminder.findMany({
      where: {
        completed: false,
        triggerAtUTC: { lte: now },
      },
      include: {
        task: { include: { user: true } },
      },
    });

    for (const reminder of dueReminders) {
      await sendReminder(reminder.task);

      await prisma.reminderSend.create({
        data: { reminderId: reminder.id },
      });

      await prisma.taskReminder.update({
        where: { id: reminder.id },
        data: { completed: true },
      });
    }

    console.log(`✅ Sent ${dueReminders.length} reminders`);
  } catch (err) {
    console.error("Cron job error:", err);
  }
};

const sendReminder = async (task) => {
  try {
    const html = await ejs.renderFile(
      path.join(__dirname, "../templates/taskReminder.ejs"),
      {
        task,
        deadline: task.deadlineUTC,
        userName: `${task.user.firstName} ${task.user.lastName}`,
        actionLink: `${process.env.CLIENT_APP_URL}/tasks/${task.id}`,
      }
    );

    await sendEmail({
      to: task.user.email,
      subject: `Reminder: ${task.title}`,
      html,
    });
  } catch (err) {
    console.error("Send Reminder failed:", err);
  }
};
