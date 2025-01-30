const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("./mailer");
const { format } = require("date-fns");

const executeCron = async (res) => {
  try {
    console.log("Executing manual cron job...");

    const tasks = await Task.findAll({
      where: {
        deadline: { [Op.gt]: new Date() },
        reminderSent: false,
      },
    });

    console.log(`Fetched ${tasks.length} tasks`);

    for (const task of tasks) {
      await sendDeadlineReminder(task);
    }

  } catch (error) {
    console.error("Error executing cron job:", error);
  }
};

const sendDeadlineReminder = async (task) => {
  try {
    const deadlineDate = new Date(task.deadline);
    const timeBeforeDeadline = deadlineDate - new Date();
    const reminderTime = 60 * 60 * 1000;

    if (timeBeforeDeadline <= reminderTime && timeBeforeDeadline > 0) {
      const user = await User.findByPk(task.userId);
      if (!user) return;

      const email = user.email;

      const htmlContent = await ejs.renderFile(
        path.join(__dirname, "../templates/taskReminder.ejs"),
        {
          task: task,
          deadlineIn: formatRelativeTime(task.deadline),
          userName: `${user.firstName} ${user.lastName}`,
          actionLink: `https://tejanarra.github.io/Task-Manager`,
          theme: "dark",
        }
      );

      const emailData = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Task Reminder: ${task.title}`,
        html: htmlContent,
      };

      try {
        await sendEmail(emailData);
        console.log(`✅ Email sent for task: ${task.title}`);

        task.reminderSent = true;
        await task.save();

        console.log(`✅ Reminder sent successfully for task: ${task.title}`);
      } catch (emailError) {
        console.error(
          `🚨 Failed to send email for task: ${task.title}`,
          emailError
        );
      }
    }
  } catch (error) {
    console.error(`🚨 Error sending reminder for task ${task.title}:`, error);
  }
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);

  if (diffInSeconds < 0) {
    const futureDiff = Math.abs(diffInSeconds);
    if (futureDiff < 60)
      return `in ${futureDiff} second${futureDiff !== 1 ? "s" : ""}`;
    if (futureDiff < 3600) return `in ${Math.ceil(futureDiff / 60)} minutes`;
    if (futureDiff < 86400) return `in ${Math.ceil(futureDiff / 3600)} hours`;
    return format(date, "MMM dd, yyyy");
  } else {
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return format(date, "MMM dd, yyyy");
  }
};

module.exports = { executeCron };
