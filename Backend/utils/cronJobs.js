const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("./mailer");
const { format } = require("date-fns");

const executeCron = async () => {
  try {
    console.log("Executing cron job for reminders...");

    const tasks = await Task.findAll({
      where: {
        deadline: { [Op.gt]: new Date() },
        status: { [Op.ne]: "completed" },
      },
    });

    console.log(`Fetched ${tasks.length} tasks to check for reminders.`);

    for (const task of tasks) {
      if (!Array.isArray(task.reminders) || task.reminders.length === 0) {
        console.log(`Skipping task #${task.id} - no reminders set.`);
        continue;
      }

      const now = new Date();
      const deadlineDate = new Date(task.deadline);

      const sortedReminders = [...task.reminders].sort(
        (a, b) => a.remindBefore - b.remindBefore
      );

      let isUpdated = false;

      for (let i = 0; i < sortedReminders.length; i++) {
        const reminder = sortedReminders[i];

        if (reminder.sent) {
          continue;
        }

        const timeBeforeDeadline = deadlineDate - now;
        const reminderTime = reminder.remindBefore * 60 * 60 * 1000;

        if (timeBeforeDeadline <= reminderTime && timeBeforeDeadline > 0) {
          await sendDeadlineReminder(task, reminder.remindBefore);
          reminder.sent = true;
          isUpdated = true;

          for (let j = i + 1; j < sortedReminders.length; j++) {
            const higherReminder = sortedReminders[j];
            if (!higherReminder.sent) {
              higherReminder.sent = true;
              isUpdated = true;
              console.log(
                `Marking remindBefore:${higherReminder.remindBefore} as sent (no email).`
              );
            }
          }

          break;
        }
      }

      if (isUpdated) {
        task.reminders = sortedReminders;
        task.changed("reminders", true);
        await task.save();
        console.log(`Task #${task.id} updated in DB.`);
      }
    }
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
};

const sendDeadlineReminder = async (task, remindBefore) => {
  try {
    const user = await User.findByPk(task.userId);
    if (!user) return;

    const email = user.email;

    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "../templates/taskReminder.ejs"),
      {
        task,
        deadlineIn: formatRelativeTime(task.deadline),
        userName: `${user.firstName} ${user.lastName}`,
        remindBefore,
        actionLink: "https://tejanarra.github.io/Task-Manager",
        theme: "dark",
      }
    );

    const emailData = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Task Reminder: ${task.title}`,
      html: htmlContent,
    };

    await sendEmail(emailData);
    console.log(
      `✅ Email sent for task "${task.title}" (remindBefore: ${remindBefore}hr).`
    );
  } catch (emailError) {
    console.error(
      `🚨 Failed to send email for task: ${task.title}`,
      emailError
    );
  }
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);

  if (diffInSeconds > 0) {
    if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours`;
    return format(date, "MMM dd, yyyy hh:mm a");
  } else {
    return format(date, "MMM dd, yyyy hh:mm a");
  }
};

module.exports = { executeCron };
