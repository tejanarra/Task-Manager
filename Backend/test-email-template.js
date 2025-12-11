// Test Email Template Preview
// This script generates a preview HTML of the task reminder email

import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { formatInTimeZone } from 'date-fns-tz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock task data
const mockTask = {
  id: 1,
  title: 'Complete Project Proposal',
  description: 'Finalize and submit the Q1 project proposal to the stakeholders. Include budget estimates, timeline, and resource allocation.',
  status: 'in-progress',
  deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
};

// Status mappings
const STATUS_COLORS = {
  'completed': '#007a00',
  'in-progress': '#daa520',
  'not-started': '#a00000',
};

const STATUS_ICONS = {
  'completed': 'bi-check-circle',
  'in-progress': 'bi-hourglass',
  'not-started': 'bi-ban',
};

const STATUS_LABELS = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'not-started': 'Not Started',
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
    const days = Math.ceil(diffInSeconds / 86400);
    return days === 1 ? `1 day` : `${days} days`;
  }

  return 'Past due';
};

// Generate email preview for both light and dark themes
const generatePreview = async () => {
  const userTimeZone = 'America/New_York'; // Example timezone
  const deadlineFormatted = formatInTimeZone(
    mockTask.deadline,
    userTimeZone,
    'MMM dd, yyyy hh:mm a'
  );

  const templateData = {
    task: mockTask,
    deadlineIn: formatRelativeTime(mockTask.deadline),
    deadlineFormatted: `${deadlineFormatted} (${userTimeZone})`,
    userName: 'John Doe',
    remindBefore: '1 day before deadline',
    actionLink: 'https://tejanarra.github.io/Task-Manager/login',
    statusColor: STATUS_COLORS[mockTask.status],
    statusIcon: STATUS_ICONS[mockTask.status],
    statusLabel: STATUS_LABELS[mockTask.status],
  };

  // Generate light theme version
  const lightHtml = await ejs.renderFile(
    path.join(__dirname, 'templates/taskReminder.ejs'),
    { ...templateData, theme: 'light' }
  );

  // Generate dark theme version
  const darkHtml = await ejs.renderFile(
    path.join(__dirname, 'templates/taskReminder.ejs'),
    { ...templateData, theme: 'dark' }
  );

  // Create test-output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Write preview files
  fs.writeFileSync(
    path.join(outputDir, 'email-preview-light.html'),
    lightHtml
  );
  fs.writeFileSync(
    path.join(outputDir, 'email-preview-dark.html'),
    darkHtml
  );

  console.log('✅ Email template previews generated successfully!');
  console.log(`📁 Light theme: ${path.join(outputDir, 'email-preview-light.html')}`);
  console.log(`📁 Dark theme: ${path.join(outputDir, 'email-preview-dark.html')}`);
  console.log('\n📧 Template data used:');
  console.log(JSON.stringify(templateData, null, 2));
  console.log('\n💡 Open the HTML files in a browser to preview the emails.');
};

generatePreview().catch(console.error);
