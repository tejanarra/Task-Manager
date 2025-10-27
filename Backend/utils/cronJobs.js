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
        triggerAtUTC: { lte: now },
      },
      include: {
        task: {
          include: {
            user: true,
          },
        },
        sends: true,
      },
    });

    for (const reminder of dueReminders) {
      const { task, sends } = reminder;
      if (!task || sends.length > 0) continue;

      await sendReminder(task);

      await prisma.reminderSend.create({
        data: {
          reminderId: reminder.id,
          sentAtUTC: new Date(),
        },
      });
    }
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
        actionLink:
          process.env.CLIENT_APP_URL ||
          "https://tejanarra.github.io/Task-Manager/login",
      }
    );

    await sendEmail({
      to: task.user.email,
      from: process.env.EMAIL_USER,
      subject: `Reminder: ${task.title}`,
      html,
    });

    console.log("Reminder sent:", task.title);
  } catch (err) {
    console.error("Reminder sending failed:", err);
  }
};

export default { executeCron };
