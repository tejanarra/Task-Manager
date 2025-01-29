const cron = require("node-cron");
const { sendEmail } = require("./mailer");
const { Op } = require("sequelize");
const User = require("../models/User");
const Task = require("../models/Task");
const ejs = require("ejs");
const path = require("path");
const jwt = require("jsonwebtoken");

cron.schedule("* * * * *", async () => {
  console.log("Checking for upcoming task deadlines...");

  try {
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
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
});

const sendDeadlineReminder = async (task) => {
  try {
    const deadlineDate = new Date(task.deadline);
    const timeBeforeDeadline = deadlineDate - new Date();
    const reminderTime = 60 * 60 * 1000;

    if (timeBeforeDeadline <= reminderTime && timeBeforeDeadline > 0) {
      const user = await fetchEmail(task.userId);
      const email = user.email;

      if (email) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRATION,
        });

        const htmlContent = await ejs.renderFile(
          path.join(__dirname, "../templates/taskReminder.ejs"),
          {
            task: task,
            userName: `${user.firstName} ${user.lastName}`,
            actionLink: `http://localhost:3000/Task-Manager#/`,
            theme: "light",
          }
        );

        const emailData = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Task Reminder: ${task.title}`,
          html: htmlContent,
        };

        sendEmail(emailData);

        console.log(`Sending mail for ${task.title}`);

        task.reminderSent = true;
        await task.save();

        console.log(`Reminder sent for task: ${task.title}`);
      }
    }
  } catch (error) {
    console.error(`Error sending reminder for task ${task.title}:`, error);
  }
};

const fetchEmail = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (user) {
      return user;
    } else {
      console.log(`User with ID ${userId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching email for user ${userId}:`, error);
    return null;
  }
};

// const createVerificationEmail = (email, task) => {
//   const subject = `Task Reminder: ${task.title}`;
//   const text = `Your task "${
//     task.title
//   }" is due soon at ${task.deadline.toLocaleString()}.\n\nPlease take action.`;

//   return {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject,
//     text,
//   };
// };
