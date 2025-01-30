const cron = require("node-cron");
const { sendEmail } = require("./mailer");
const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const jwt = require("jsonwebtoken");

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

    tasks.forEach((task) => {
      sendDeadlineReminder(task);
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
    if (!task || !task.deadline) {
      console.log(`🚨 Skipping invalid task: ${JSON.stringify(task)}`);
      return;
    }

    const deadlineDate = new Date(task.deadline);
    const timeBeforeDeadline = deadlineDate - new Date();
    const reminderTime = 60 * 60 * 1000; // 1 hour

    if (timeBeforeDeadline > reminderTime || timeBeforeDeadline <= 0) {
      console.log(
        `🚨 Skipping task: ${task.title}, deadline is too far or passed`
      );
      return;
    }

    const user = await fetchEmail(task.userId);
    if (!user || !user.email) {
      console.log(`🚨 No email found for user: ${task.userId}`);
      return;
    }

    console.log(`📩 Sending reminder for: ${task.title} to ${user.email}`);

    const emailData = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Task Reminder: ${task.title}`,
      text: `Your task "${task.title}" is due soon ${task.deadline}. Please take action.`,
    };

    await sendEmail(emailData);

    console.log(`✅ Reminder sent for task: ${task.title}`);
    task.reminderSent = true;
    await task.save();
  } catch (error) {
    console.error(`❌ Error sending reminder for ${task.title}:`, error);
  }
};

const fetchEmail = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    return user || null;
  } catch (error) {
    console.error(`Error fetching email for user ${userId}:`, error);
    return null;
  }
};

module.exports = { executeCron };
