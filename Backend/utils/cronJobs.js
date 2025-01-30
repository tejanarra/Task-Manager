const cron = require("node-cron");
const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const errors = require("./errors");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
  }
};

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
      //   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      //     expiresIn: process.env.JWT_EXPIRATION,
      //   });

      const htmlContent = await ejs.renderFile(
        path.join(__dirname, "../templates/taskReminder.ejs"),
        {
          task: task,
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

      sendEmail(emailData);
      //   console.log(`Sending mail for task: ${task.title}`);

      //   task.reminderSent = true;
      //   await task.save();

      //   console.log(`Reminder sent for task: ${task.title}`);
    }
  } catch (error) {
    console.error(`Error sending reminder for task ${task.title}:`, error);
  }
};

// const fetchEmail = async (userId) => {
//   try {
//     const user = await User.findByPk(userId);
//     console.error(`fetching email for user ${userId}:`, user);
//     return user || null;
//   } catch (error) {
//     console.error(`Error fetching email for user ${userId}:`, error);
//     return null;
//   }
// };

module.exports = { executeCron };
