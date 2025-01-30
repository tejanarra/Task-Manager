// const cron = require("node-cron");
const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// const errors = require("./errors");
const { sendEmail } = require("./mailer");
import { format } from "date-fns";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// const sendEmail = async (mailOptions) => {
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${mailOptions.to}`);
//   } catch (error) {
//     console.error("Email sending error:", error);
//     throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
//   }
// };

const executeCron = async (req, res) => {
  try {
    console.log("Executing manual cron job...");
    const tasks = await Task.findAll({
      where: {
        deadline: {
          [Op.gt]: new Date(),
        },
        reminderSent: false,
      },
    });

    console.log(`Fetched ${tasks.length} tasks`);

    tasks.forEach(async (task) => {
      await sendDeadlineReminder(task);
    });

    return res.status(200).json({ message: "Cron job executed successfully!" });
  } catch (error) {
    console.error("Error executing cron job:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// cron.schedule("* * * * *", async () => {
//   console.log("Scheduled cron job running...");

//   try {
//     const tasks = await Task.findAll({
//       where: {
//         deadline: {
//           [Op.gt]: new Date(),
//         },
//         reminderSent: false,
//       },
//     });

//     console.log(`Fetched ${tasks.length} tasks`);

//     tasks.forEach((task) => {
//       sendDeadlineReminder(task);
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//   }
// });

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
          deadlineIn: formatRelativeTime(new Date(task.deadline).toISOString()),
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

      const emailStatus = await sendEmail(emailData);

      if (emailStatus === 100) {
        console.log(`✅ Sending mail for task: ${task.title}`);

        task.reminderSent = true;
        await task.save();

        console.log(`✅ Reminder sent for task: ${task.title}`);
      } else {
        console.log(`FAILED TO SEND EMAIL`);
      }
    }
  } catch (error) {
    console.error(`Error sending reminder for task ${task.title}:`, error);
  }
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const justNowThreshold = 60;

  if (diffInSeconds < 0) {
    const futureDiff = Math.abs(diffInSeconds);
    if (futureDiff < justNowThreshold) {
      return "Just now";
    } else if (futureDiff < 60) {
      return `in ${futureDiff} second${futureDiff !== 1 ? "s" : ""}`;
    } else if (futureDiff < 3600) {
      const minutes = Math.ceil(futureDiff / 60);
      return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (futureDiff < 86400) {
      const hours = Math.ceil(futureDiff / 3600);
      return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (futureDiff < 604800) {
      const days = Math.ceil(futureDiff / 86400);
      return `in ${days} day${days !== 1 ? "s" : ""}`;
    } else {
      return format(date, "MMM dd, yyyy");
    }
  } else {
    if (diffInSeconds < justNowThreshold) {
      return "Just now";
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "Yesterday" : `${days} days ago`;
    } else {
      return format(date, "MMM dd, yyyy");
    }
  }
};

module.exports = { executeCron };
