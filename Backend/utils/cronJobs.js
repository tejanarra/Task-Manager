const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("./mailer");
const { format } = require("date-fns");

const executeCron = async () => {
  try {
    const tasks = await Task.findAll({
      where: {
        deadline: { [Op.gt]: new Date() },
        status: { [Op.ne]: "completed" },
      },
    });

    for (const task of tasks) {
      if (!Array.isArray(task.reminders) || task.reminders.length === 0) {
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
          sortedReminders.splice(i);
          break;
        }
      }

      if (isUpdated) {
        task.reminders = sortedReminders;
        task.changed("reminders", true);
        await task.save();
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
        actionLink: "https://tejanarra.github.io/Task-Manager/login",
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
  } catch (emailError) {
    console.error(`Failed to send email for task: ${task.title}`, emailError);
  }
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  
  if (diffInSeconds > 0) {
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds`;
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.ceil(diffInSeconds / 60);
      return minutes === 1 ? `1 minute` : `${minutes} minutes`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.ceil(diffInSeconds / 3600);
      return hours === 1 ? `1 hour` : `${hours} hours`;
    }
    if (diffInSeconds < 172800) {
      return `1 day`;
    }
    return format(date, "MMM dd, yyyy hh:mm a");
  }
  
  return format(date, "MMM dd, yyyy hh:mm a");
};


module.exports = { executeCron };
