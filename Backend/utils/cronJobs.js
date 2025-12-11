// Cron Jobs for Task Reminders
// Automated email reminders based on task deadlines

import { Op } from 'sequelize';
import User from '../models/User.js';
import Task from '../models/Task.js';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail } from './mailer.js';
import { format, formatInTimeZone } from 'date-fns-tz';
import { EMAIL_CONFIG } from '../constants/config.js';
import {
  getReadyReminders,
  markReminderAsSent,
} from './reminderHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executeCron = async () => {
  let stats = {
    tasksChecked: 0,
    remindersSent: 0,
    errors: 0,
    skipped: 0
  };

  try {
    const tasks = await Task.findAll({
      where: {
        deadline: { [Op.gt]: new Date() },
        status: { [Op.ne]: 'completed' },
      },
    });

    stats.tasksChecked = tasks.length;
    console.log(`📋 Checking ${tasks.length} active tasks with future deadlines`);

    for (const task of tasks) {
      if (!Array.isArray(task.reminders) || task.reminders.length === 0) {
        stats.skipped++;
        continue;
      }

      // Get reminders that are ready to be sent
      const readyReminders = getReadyReminders(task.reminders, task.deadline);

      if (readyReminders.length === 0) {
        stats.skipped++;
        continue;
      }

      let isUpdated = false;

      // Send each ready reminder
      for (const reminder of readyReminders) {
        try {
          await sendDeadlineReminder(task, reminder);
          stats.remindersSent++;

          // Mark reminder as sent in the task's reminder array
          const index = task.reminders.findIndex(r =>
            r.type === reminder.type &&
            (r.remindAt === reminder.remindAt || r.intervalHours === reminder.intervalHours)
          );

          if (index !== -1) {
            task.reminders[index] = markReminderAsSent(task.reminders[index]);
            isUpdated = true;
          }
        } catch (error) {
          console.error(`❌ Failed to send reminder for task ${task.id}:`, error);
          stats.errors++;
        }
      }

      // Save updated reminders
      if (isUpdated) {
        task.changed('reminders', true);
        await task.save();
      }
    }

    console.log(`📊 Cron job summary: ${stats.remindersSent} sent, ${stats.errors} errors, ${stats.skipped} skipped`);
    return { success: true, count: stats.remindersSent, stats };
  } catch (error) {
    console.error('❌ Critical error executing cron job:', error);
    stats.errors++;
    return { success: false, count: 0, stats, error: error.message };
  }
};

// Status color mapping (matching frontend)
const STATUS_COLORS = {
  'completed': '#007a00',
  'in-progress': '#daa520',
  'not-started': '#a00000',
};

// Status icon mapping (Unicode symbols)
const STATUS_ICONS = {
  'completed': '✓',
  'in-progress': '◷',
  'not-started': '○',
};

// Status label mapping
const STATUS_LABELS = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'not-started': 'Not Started',
};

const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS['not-started'];
};

const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || STATUS_ICONS['not-started'];
};

const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || STATUS_LABELS['not-started'];
};

const getReminderDescription = (reminder, deadline) => {
  if (!reminder) return 'Task reminder';

  const { type, remindAt } = reminder;

  if (type === 'daily') return 'Daily reminder';
  if (type === 'weekly') return 'Weekly reminder';

  // One-time reminder - calculate hours before deadline
  if (remindAt && deadline) {
    const deadlineDate = new Date(deadline);
    const remindDate = new Date(remindAt);
    const diffHours = (deadlineDate - remindDate) / (1000 * 60 * 60);

    if (diffHours < 1) return `${Math.round(diffHours * 60)} minutes before`;
    if (diffHours < 24) return `${Math.round(diffHours)} hour${diffHours !== 1 ? 's' : ''} before`;
    const days = diffHours / 24;
    if (days < 7) return `${Math.round(days)} day${Math.round(days) !== 1 ? 's' : ''} before`;
    const weeks = days / 7;
    return `${Math.round(weeks)} week${Math.round(weeks) !== 1 ? 's' : ''} before`;
  }

  return 'Task reminder';
};

const sendDeadlineReminder = async (task, reminder) => {
  try {
    const user = await User.findByPk(task.userId);
    if (!user) return;

    // Determine user timezone (default to UTC if not set)
    const userTimeZone = user.timezone || 'UTC';

    // Format deadline in user's timezone
    const deadlineDate = new Date(task.deadline);
    const deadlineFormatted = formatInTimeZone(
      deadlineDate,
      userTimeZone,
      'MMM dd, yyyy hh:mm a zzz'
    );

    const email = user.email;
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, '../templates/taskReminder.ejs'),
      {
        task,
        deadlineIn: formatRelativeTime(task.deadline),
        deadlineFormatted,
        userName: `${user.firstName} ${user.lastName}`,
        remindBefore: getReminderDescription(reminder, task.deadline),
        actionLink: `${EMAIL_CONFIG.FRONTEND_BASE_URL}/login`,
        statusColor: getStatusColor(task.status),
        statusIcon: getStatusIcon(task.status),
        statusLabel: getStatusLabel(task.status),
        theme: 'light', // Can be made dynamic based on user preference
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
    return format(date, 'MMM dd, yyyy hh:mm a');
  }

  return format(date, 'MMM dd, yyyy hh:mm a');
};
