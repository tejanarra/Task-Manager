# Task Manager - Complete Reminder System Documentation

**Last Updated:** December 5, 2025
**Version:** 2.0.0 (Simplified Architecture)

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Changes](#architecture-changes)
3. [How Reminders Work - Complete Flow](#how-reminders-work---complete-flow)
4. [Timezone Handling](#timezone-handling)
5. [AI Integration](#ai-integration)
6. [External Cron Job Setup](#external-cron-job-setup)
7. [Testing Guide](#testing-guide)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The Task Manager reminder system sends automated email notifications for tasks based on deadlines. The system supports:

- **One-Time Reminders**: Single notification at specific time (e.g., 24 hours before deadline)
- **Daily Reminders**: Recurring notification every 24 hours until deadline
- **Weekly Reminders**: Recurring notification every 7 days until deadline
- **Custom Date Reminders**: User-selected specific date/time
- **AI-Generated Reminders**: Intelligent reminder suggestions from AI
- **Timezone-Aware**: All reminders respect user's local timezone

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                    REMINDER SYSTEM FLOW                     │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
  ├── TaskEditor.js - User creates/edits tasks with reminders
  ├── TaskReminders.js - Reminder selection UI
  ├── useTaskReminders.js - Reminder state management
  └── reminderUtils.js - Frontend reminder normalization

          ↓ HTTP Request (with x-user-timezone header)

Backend (Express)
  ├── taskController.js - Receives task with reminders
  ├── aiController.js - AI generates tasks with reminders
  ├── reminderHelpers.js - Centralized reminder logic
  └── Database (PostgreSQL) - Stores normalized reminders

          ↓ Every 5 minutes

External Cron Service (cronjob.org)
  └── Hits GET /api/auth/cronrun

          ↓

Backend Cron Job (cronJobs.js)
  ├── Finds tasks with future deadlines
  ├── Checks which reminders are ready
  ├── Sends emails via Nodemailer
  └── Marks reminders as sent
```

---

## Architecture Changes

### What Changed (v2.0.0)

**✅ SIMPLIFIED & CENTRALIZED:**

1. **Created `Backend/utils/reminderHelpers.js`** - Single source of truth for reminder logic
   - `normalizeReminders()` - Converts any format to standardized format
   - `createOneTimeReminder()` - Creates one-time reminders
   - `createRecurringReminder()` - Creates daily/weekly reminders
   - `getReadyReminders()` - Finds reminders ready to send
   - `markReminderAsSent()` - Updates reminder status
   - `isValidReminder()` - Validates reminder structure

2. **Removed Legacy Format** - Old `remindBefore` calculation logic removed from:
   - `aiController.js` (removed 150+ lines of complex logic)
   - `taskController.js` (simplified to use helper)
   - `timeHelpers.js` (moved to reminderHelpers)

3. **Frontend Updates**:
   - `reminderUtils.js` - Now mirrors backend logic
   - `useTaskReminders.js` - Simplified state management
   - `TaskReminders.js` - Cleaner UI rendering

4. **External Cron Integration**:
   - Added `GET /api/auth/cronrun` endpoint
   - Supports optional `CRON_SECRET` for security
   - Works with cronjob.org (or any external cron service)
   - No native cron dependency (Vercel compatible)

### Why This Matters

- **Consistency**: Backend and frontend use same logic
- **Maintainability**: One place to fix bugs or add features
- **Testability**: Isolated functions are easy to test (244 tests passing!)
- **Scalability**: Handles Vercel's serverless constraints
- **Reliability**: Timezone-aware, deduplication, validation built-in

---

## How Reminders Work - Complete Flow

### Scenario 1: User Creates Task with One-Time Reminder

**Frontend:**
```javascript
// User inputs in TaskEditor
const task = {
  title: "Submit project proposal",
  description: "Final version",
  deadline: "2025-12-15T17:00:00Z", // UTC
  reminders: [
    { remindBefore: 24, type: "one-time" } // 24 hours before
  ]
};

// Frontend sends to API
POST /api/tasks
Headers: { "x-user-timezone": "America/New_York" }
Body: task
```

**Backend Processing:**
```javascript
// taskController.js receives request
const userTimeZone = req.headers['x-user-timezone'] || 'UTC';

// normalizeReminders() called
const normalized = normalizeReminders(
  [{ remindBefore: 24, type: "one-time" }],
  "2025-12-15T17:00:00Z",
  "America/New_York"
);

// Result stored in DB:
{
  type: "one-time",
  remindAt: "2025-12-14T17:00:00.000Z", // 24h before deadline
  sent: false,
  lastSentAt: null
}
```

**Cron Execution (5 minutes later):**
```javascript
// cronJobs.js runs every 5 mins via cronjob.org

// 1. Find all tasks with future deadlines and not completed
const tasks = await Task.findAll({
  where: {
    deadline: { [Op.gt]: new Date() },
    status: { [Op.ne]: 'completed' }
  }
});

// 2. For each task, check ready reminders
const readyReminders = getReadyReminders(task.reminders, task.deadline);
// Returns reminders where: remindAt <= currentTime

// 3. Send email
await sendDeadlineReminder(task, reminder);

// 4. Mark as sent
task.reminders[0] = {
  ...task.reminders[0],
  sent: true,
  lastSentAt: "2025-12-14T17:05:00.000Z"
};
await task.save();
```

**Email Sent:**
```
From: noreply@taskmanager.com
To: user@example.com
Subject: Task Reminder: Submit project proposal

Hi John Doe,

You have a task deadline approaching in 24 hours.

Task: Submit project proposal
Deadline: Dec 15, 2025 05:00 PM
Reminder: 24 hours before

[View Task] → https://tejanarra.github.io/Task-Manager/login
```

---

### Scenario 2: User Creates Task with Daily Recurring Reminder

**User Input:**
- Title: "Team standup preparation"
- Deadline: 7 days from now
- Reminders: [Daily reminder enabled]

**Backend Storage:**
```json
{
  "type": "daily",
  "intervalHours": 24,
  "sent": false,
  "lastSentAt": null
}
```

**How It Triggers:**
```javascript
// Day 1 (7 days before deadline) - First reminder
// hoursUntilDeadline = 168
// intervalHours = 24
// Condition: hoursUntilDeadline <= intervalHours ? NO (168 > 24)
// Result: Not sent yet

// Day 6 (1.5 days before deadline) - First reminder
// hoursUntilDeadline = 36
// lastSentAt = null
// Condition: hoursUntilDeadline <= 24 && hoursUntilDeadline > 0 ? YES
// Result: Email sent, lastSentAt = current time

// Day 7 (0.5 days before deadline) - Second reminder
// hoursUntilDeadline = 12
// lastSentAt = 24 hours ago
// hoursSinceLastSent = 24
// Condition: hoursSinceLastSent >= 24 && hoursUntilDeadline > 0 ? YES
// Result: Email sent again, lastSentAt updated
```

**Key Logic:**
- First reminder: Sent when `hoursUntilDeadline <= intervalHours`
- Subsequent reminders: Sent when `hoursSinceLastSent >= intervalHours`
- Stops after deadline passes (hoursUntilDeadline <= 0)
- Never marked as `sent: true` (can fire multiple times)

---

### Scenario 3: User Creates Task with Weekly Recurring Reminder

**User Input:**
- Deadline: 14 days from now
- Reminders: [Weekly reminder enabled]

**Backend Storage:**
```json
{
  "type": "weekly",
  "intervalHours": 168,
  "sent": false,
  "lastSentAt": null
}
```

**Trigger Timeline:**
- **Day 1-7:** No reminder (hoursUntilDeadline > 168)
- **Day 7:** First reminder sent (hoursUntilDeadline = 168)
- **Day 14:** Second reminder sent (hoursSinceLastSent >= 168)

**Important:** Weekly reminders require `hoursUntilDeadline < intervalHours` (line 158 in reminderHelpers.js), so deadline must be more than 7 days away.

---

### Scenario 4: User Creates Custom Date Reminder

**User Input:**
- Deadline: Dec 20, 2025 5:00 PM (user's timezone)
- Custom reminder: Dec 18, 2025 3:00 PM (user's timezone)

**Frontend Processing:**
```javascript
// Frontend sends
{
  customDate: "2025-12-18T15:00:00-05:00", // User's local time
  type: "one-time"
}
```

**Backend Processing:**
```javascript
// createOneTimeReminderFromDate() called
const customDT = DateTime.fromISO("2025-12-18T15:00:00-05:00", {
  zone: "America/New_York" // User's timezone
});

// Convert to UTC for storage
const remindAt = customDT.toUTC().toISO();
// Result: "2025-12-18T20:00:00.000Z"
```

**Cron Execution:**
- At 2025-12-18 8:00 PM UTC (3:00 PM EST), email is sent
- User receives reminder in their local time

---

### Scenario 5: AI Generates Task with Multiple Reminders

**User Prompt:**
```
"Create a task to prepare for next week's presentation.
Remind me 2 days before and 1 day before."
```

**AI Response:**
```json
{
  "title": "Prepare for presentation",
  "description": "Finalize slides and practice",
  "deadline": "2025-12-12T14:00:00Z",
  "reminders": [
    { "remindBefore": 48, "type": "one-time" },
    { "remindBefore": 24, "type": "one-time" }
  ]
}
```

**Backend Normalization:**
```javascript
// normalizeReminders() processes both
const normalized = [
  {
    type: "one-time",
    remindAt: "2025-12-10T14:00:00.000Z", // 48h before
    sent: false,
    lastSentAt: null
  },
  {
    type: "one-time",
    remindAt: "2025-12-11T14:00:00.000Z", // 24h before
    sent: false,
    lastSentAt: null
  }
];
```

**Result:**
- User receives 2 separate emails
- First: 2 days before deadline
- Second: 1 day before deadline

---

### Scenario 6: User Updates Task Deadline

**Original Task:**
- Deadline: Dec 10, 2025
- Reminders: [24 hours before, 48 hours before]

**User Updates Deadline to Dec 15, 2025:**

**Frontend:**
```javascript
PUT /api/tasks/:id
{
  deadline: "2025-12-15T17:00:00Z",
  reminders: task.reminders // Send existing reminders
}
```

**Backend Processing:**
```javascript
// taskController.js updateTask()
const normalized = normalizeReminders(
  task.reminders, // Existing reminders
  "2025-12-15T17:00:00Z", // New deadline
  userTimeZone
);

// Result: remindAt timestamps recalculated
// Old: remindAt = "2025-12-09T17:00:00Z"
// New: remindAt = "2025-12-14T17:00:00Z"
```

**Key Behavior:**
- **One-time reminders:** remindAt recalculated based on new deadline
- **Recurring reminders:** No change (still based on intervalHours)
- **Sent status preserved:** If reminder was already sent, it stays sent

---

### Scenario 7: AI Updates Task in Chat Mode

**User:** "Move the deadline to next Monday"

**AI Response:**
```json
{
  "action": "update",
  "taskId": 123,
  "newDeadline": "2025-12-09T17:00:00Z"
}
```

**Backend Processing:**
```javascript
// aiController.js chatConversation()
// If newDeadline changed, re-normalize reminders
if (parsedAction.newDeadline) {
  reminders = normalizeReminders(
    task.reminders,
    updatedDeadline,
    userTimeZone
  );
}
```

**Result:**
- All reminders recalculated for new deadline
- Previously sent reminders remain sent
- New remindAt times generated

---

### Scenario 8: AI Clears All Reminders

**User:** "Remove all reminders from this task"

**AI Response:**
```json
{
  "action": "update",
  "taskId": 123,
  "newReminders": []
}
```

**Backend Processing:**
```javascript
// Check for explicit empty array
if (Array.isArray(parsedAction.newReminders) &&
    parsedAction.newReminders.length === 0) {
  reminders = []; // Clear all reminders
}
```

**Result:**
- All reminders deleted from task
- No future emails will be sent

---

## Timezone Handling

### How Timezones Work

1. **Frontend Sends Timezone:**
```javascript
// Detected automatically or set by user
headers: {
  'x-user-timezone': 'America/New_York' // IANA timezone
}
```

2. **Backend Extracts Timezone:**
```javascript
// utils/timeHelpers.js
export const getUserTimeZone = (req) => {
  return req.headers['x-user-timezone'] || 'UTC';
};
```

3. **Reminder Calculation Uses Luxon:**
```javascript
import { DateTime } from 'luxon';

// Parse deadline in UTC
const deadlineDT = DateTime.fromISO(deadline, { zone: 'utc' });

// Calculate reminder time
const remindAtDT = deadlineDT.minus({ hours: 24 });

// Store in UTC
remindAt: remindAtDT.toISO() // "2025-12-14T17:00:00.000Z"
```

4. **Cron Job Checks in UTC:**
```javascript
// All comparisons done in UTC
const now = DateTime.now().setZone('utc');
const remindAtDT = DateTime.fromISO(remindAt, { zone: 'utc' });

if (now >= remindAtDT) {
  // Send reminder
}
```

### Timezone Examples

**User in New York (UTC-5):**
- Sets deadline: Dec 15, 2025 5:00 PM EST
- Backend stores: "2025-12-15T22:00:00Z" (UTC)
- Reminder (24h before): "2025-12-14T22:00:00Z"
- Email sent: When UTC time reaches Dec 14, 10:00 PM
- User sees: Dec 14, 5:00 PM EST (their local time)

**User in London (UTC+0):**
- Sets deadline: Dec 15, 2025 5:00 PM GMT
- Backend stores: "2025-12-15T17:00:00Z" (UTC)
- Reminder (24h before): "2025-12-14T17:00:00Z"
- Email sent: When UTC time reaches Dec 14, 5:00 PM
- User sees: Dec 14, 5:00 PM GMT

**User in Tokyo (UTC+9):**
- Sets deadline: Dec 16, 2025 2:00 AM JST
- Backend stores: "2025-12-15T17:00:00Z" (UTC)
- Reminder (24h before): "2025-12-14T17:00:00Z"
- Email sent: When UTC time reaches Dec 14, 5:00 PM UTC
- User sees: Dec 15, 2:00 AM JST

### Edge Cases Handled

✅ **Daylight Saving Time:** Luxon handles DST transitions
✅ **Date Line:** UTC storage prevents confusion
✅ **Invalid Timezones:** Falls back to UTC
✅ **Past Reminders:** Filtered out during normalization
✅ **Future Deadlines:** Only tasks with deadline > now are checked

---

## AI Integration

### AI Reminder Generation

**AI Model:** deepseek-v3.1:671b-cloud (via Ollama)

**AI Prompt Includes:**
```
User Timezone: America/New_York
Current Time: 2025-12-05T10:30:00-05:00

For reminders, use:
- remindBefore: hours before deadline (number)
- type: "one-time", "daily", or "weekly"
- customDate: ISO string in user's timezone (optional)
```

**AI Response Format:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "deadline": "2025-12-12T14:00:00",
  "reminders": [
    {
      "remindBefore": 24,
      "type": "one-time"
    },
    {
      "remindBefore": 24,
      "type": "daily"
    }
  ]
}
```

### AI Reminder Processing

**Step 1: AI generates reminders**
```javascript
// AI returns remindBefore format
{ remindBefore: 24, type: "one-time" }
```

**Step 2: Backend normalizes**
```javascript
// normalizeReminders() converts to remindAt format
const normalized = normalizeReminders(
  aiTask.reminders,
  deadline,
  userTimeZone
);

// Result:
{
  type: "one-time",
  remindAt: "2025-12-14T17:00:00.000Z",
  sent: false,
  lastSentAt: null
}
```

**Step 3: Stored in database**
```javascript
// PostgreSQL JSONB column
task.reminders = normalized;
```

### AI Capabilities

✅ **Understands natural language:** "remind me the day before"
✅ **Suggests appropriate reminders:** Important tasks get more reminders
✅ **Respects user timezone:** Considers user's local time
✅ **Handles multiple reminders:** Can suggest 2-5 reminders per task
✅ **Smart defaults:** Adds daily reminder for long-term tasks
✅ **Validates logic:** Won't create impossible reminders (e.g., remind 30h before for task due in 24h)

### AI Chat Mode Features

**Update Reminders:**
```
User: "Add a reminder 2 days before"
AI: { action: "update", newReminders: [...existing, newOne] }
```

**Change Reminders:**
```
User: "Change it to remind me 3 days before instead"
AI: { action: "update", newReminders: [updated] }
```

**Clear Reminders:**
```
User: "Remove all reminders"
AI: { action: "update", newReminders: [] }
```

---

## External Cron Job Setup

### Why External Cron?

**Problem:** Vercel serverless functions don't support native cron jobs.

**Solution:** Use external cron service (cronjob.org) to hit API endpoint every 5 minutes.

### Setup Instructions

#### 1. Add Cron Secret to Backend .env

```bash
# Generate secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
CRON_SECRET=a1b2c3d4e5f6...your_generated_key
```

#### 2. Configure cronjob.org

**URL:** https://console.cron-job.org/jobs

**Settings:**
- **Title:** Task Manager Reminder Emails
- **URL:** `https://task-manager-sigma-ashen.vercel.app/api/auth/cronrun?secret=YOUR_CRON_SECRET`
- **Method:** GET
- **Schedule:** Every 5 minutes (`*/5 * * * *`)
- **Timezone:** UTC
- **Enabled:** Yes

**Advanced Options:**
- Timeout: 30 seconds
- Retry on failure: 2 times
- Email on failure: Your email

#### 3. Test the Endpoint

**Method 1: Browser**
```
https://task-manager-sigma-ashen.vercel.app/api/auth/cronrun?secret=YOUR_SECRET
```

**Method 2: cURL**
```bash
curl -X GET "https://task-manager-sigma-ashen.vercel.app/api/auth/cronrun" \
  -H "x-cron-secret: YOUR_SECRET"
```

**Method 3: Postman**
```
GET /api/auth/cronrun
Headers:
  x-cron-secret: YOUR_SECRET
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Cron job executed successfully",
  "timestamp": "2025-12-05T15:30:00.000Z",
  "executionTime": "1234ms",
  "remindersSent": 5
}
```

### Monitoring Cron Job

**Backend Logs (Vercel):**
```bash
vercel logs --follow
```

**Look for:**
```
🔄 Cron job triggered via API at 2025-12-05T15:30:00.000Z
📋 Checking 25 active tasks with future deadlines
✅ Sending reminder for task: "Submit project proposal"
✅ Sending reminder for task: "Team meeting preparation"
📊 Cron job summary: 5 sent, 0 errors, 20 skipped
✅ Cron job completed in 1234ms
```

**Error Handling:**
```
❌ Failed to send reminder for task 123: User not found
❌ Critical error executing cron job: Database connection failed
```

### Security

**Option 1: Secret in Header (Recommended)**
```bash
curl -H "x-cron-secret: YOUR_SECRET" \
  https://your-api.com/api/auth/cronrun
```

**Option 2: Secret in Query Parameter**
```bash
curl https://your-api.com/api/auth/cronrun?secret=YOUR_SECRET
```

**Option 3: No Secret (Development Only)**
```bash
# Don't set CRON_SECRET in .env
# Endpoint is publicly accessible
```

**Best Practices:**
- Use long, random secret (32+ characters)
- Store in environment variables only
- Never commit to Git
- Rotate secret periodically
- Monitor unauthorized attempts (logged with IP)

---

## Testing Guide

### Unit Tests (Backend)

**Run All Tests:**
```bash
cd Backend
npm test
```

**Run Specific Test File:**
```bash
npm test -- reminderHelpers.test.js
npm test -- cronJobs.test.js
npm test -- aiController.comprehensive.test.js
```

**Run with Coverage:**
```bash
npm test:coverage
```

**Expected Results:**
```
Test Suites: 11 passed, 11 total
Tests:       244 passed, 244 total

Test Files:
✓ reminderHelpers.test.js (68 tests)
✓ cronJobs.test.js (13 tests)
✓ aiController.comprehensive.test.js (41 tests)
✓ taskController.reminders.test.js (16 tests)
✓ taskController.test.js (15 tests)
✓ aiController.test.js (19 tests)
✓ authMiddleware.test.js (5 tests)
✓ passwordUtils.test.js (11 tests)
✓ tokenUtils.test.js (12 tests)
✓ validationUtils.test.js (11 tests)
✓ profileController.test.js (33 tests)
```

### Manual Testing - Step by Step

#### Test 1: Create Task with One-Time Reminder

**Steps:**
1. Login to app
2. Click "Add Task"
3. Fill in:
   - Title: "Test One-Time Reminder"
   - Description: "Testing reminder system"
   - Deadline: Tomorrow at 3:00 PM (your local time)
4. In reminders section:
   - Click "+ Add Reminder"
   - Select "24 hours before"
   - Save task

**Verify:**
- Task created successfully
- Open task details
- Check reminders shows: "1 reminder (24 hours before)"

**Database Check:**
```sql
SELECT id, title, deadline, reminders
FROM tasks
WHERE title = 'Test One-Time Reminder';
```

**Expected reminders value:**
```json
[{
  "type": "one-time",
  "remindAt": "2025-12-06T15:00:00.000Z",
  "sent": false,
  "lastSentAt": null
}]
```

**Email Check:**
- Wait until reminder time (or manually trigger cron)
- Check your email inbox
- Should receive: "Task Reminder: Test One-Time Reminder"

#### Test 2: Create Task with Daily Reminder

**Steps:**
1. Create new task
2. Title: "Test Daily Reminder"
3. Deadline: 3 days from now at 5:00 PM
4. Enable "Daily reminder" toggle
5. Save task

**Verify:**
- Task shows "Daily" in reminders
- Database check:
```json
[{
  "type": "daily",
  "intervalHours": 24,
  "sent": false,
  "lastSentAt": null
}]
```

**Email Timeline:**
- **Day 1-2:** No emails (more than 24h away)
- **Day 2.5 (24h before):** First email sent
- **Day 3 (deadline):** Second email sent (if 24h passed since last)

#### Test 3: Create Task with Custom Date Reminder

**Steps:**
1. Create new task
2. Title: "Test Custom Reminder"
3. Deadline: Dec 20, 2025 at 5:00 PM
4. Add reminder:
   - Click "Custom date/time"
   - Select: Dec 18, 2025 at 2:00 PM
   - Save

**Verify:**
- Reminder shows specific date/time
- Database check:
```json
[{
  "type": "one-time",
  "remindAt": "2025-12-18T19:00:00.000Z",
  "sent": false,
  "lastSentAt": null
}]
```

**Note:** Time converted to UTC (19:00 UTC = 2:00 PM EST)

#### Test 4: AI Generates Task with Reminders

**Steps:**
1. Click AI chat button
2. Type: "Create a task to prepare for presentation next Friday. Remind me 2 days before and 1 day before."
3. Review AI suggestion
4. Click "Create Task"

**Verify:**
- Task created with title about presentation
- Deadline set to next Friday
- 2 reminders created (48h and 24h before)
- Check database for 2 one-time reminders

#### Test 5: Update Task Deadline (Verify Recalculation)

**Steps:**
1. Open existing task with reminder
2. Note original deadline (e.g., Dec 10)
3. Edit task
4. Change deadline to Dec 15
5. Save

**Verify:**
- Reminders recalculated
- Database check: remindAt values updated to match new deadline
- If reminder was sent, it remains sent

**Example:**
```
Before:
deadline: "2025-12-10T17:00:00Z"
remindAt: "2025-12-09T17:00:00Z" (24h before)

After:
deadline: "2025-12-15T17:00:00Z"
remindAt: "2025-12-14T17:00:00Z" (24h before new deadline)
```

#### Test 6: Timezone Handling

**Test Different Timezones:**
1. Create task with deadline: Dec 15, 5:00 PM
2. Add reminder: 24 hours before
3. Check database for UTC conversion

**Verification Script:**
```javascript
// In browser console
const deadline = new Date("2025-12-15T17:00:00"); // Local time
console.log("Local:", deadline.toLocaleString());
console.log("UTC:", deadline.toISOString());

// Expected:
// Local: 12/15/2025, 5:00:00 PM
// UTC: 2025-12-15T22:00:00.000Z (if EST, UTC-5)
```

#### Test 7: Manual Cron Trigger

**Steps:**
1. Create task with reminder set to trigger in 1 minute
2. Wait 1 minute
3. Manually trigger cron:
   ```bash
   curl -X GET "http://localhost:5001/api/auth/cronrun" \
     -H "x-cron-secret: YOUR_SECRET"
   ```
4. Check backend logs
5. Check your email

**Expected Log Output:**
```
🔄 Cron job triggered via API at 2025-12-05T15:30:00.000Z
📋 Checking 1 active tasks with future deadlines
✅ Sending reminder for task: "Test Task"
📊 Cron job summary: 1 sent, 0 errors, 0 skipped
✅ Cron job completed in 523ms
```

#### Test 8: AI Chat Mode - Update Reminders

**Steps:**
1. Create task via AI
2. Open AI chat
3. Type: "For task #5, add a reminder 3 days before"
4. Review preview
5. Apply changes

**Verify:**
- Task updated with new reminder
- Previous reminders preserved
- Check database shows both reminders

#### Test 9: Multiple Reminders

**Steps:**
1. Create task
2. Add 3 reminders:
   - 48 hours before
   - 24 hours before
   - 12 hours before
3. Save

**Verify:**
- All 3 reminders visible in UI
- Database shows 3 reminder objects
- Timeline shows 3 email deliveries

#### Test 10: Edge Case - Past Deadline

**Steps:**
1. Create task with deadline in the past
2. Try to add reminder

**Expected:**
- Reminder rejected (can't remind for past event)
- Error message shown
- Task created without reminder

---

### Integration Tests

**Test Cron Job with Real Database:**

1. **Setup Test Task:**
```sql
-- Create test user
INSERT INTO users (email, "firstName", "lastName", password, "isVerified")
VALUES ('test@example.com', 'Test', 'User', 'hashed_password', true);

-- Create test task with reminder ready to send
INSERT INTO tasks (title, description, deadline, reminders, "userId", status)
VALUES (
  'Test Reminder Task',
  'This should trigger an email',
  NOW() + INTERVAL '1 day',
  '[{"type":"one-time","remindAt":"' || (NOW() - INTERVAL '1 minute')::text || '","sent":false,"lastSentAt":null}]',
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'not-started'
);
```

2. **Trigger Cron:**
```bash
curl http://localhost:5001/api/auth/cronrun
```

3. **Check Results:**
```sql
-- Verify reminder marked as sent
SELECT reminders FROM tasks WHERE title = 'Test Reminder Task';

-- Expected:
-- [{"type":"one-time","remindAt":"...","sent":true,"lastSentAt":"2025-12-05T15:30:00.000Z"}]
```

4. **Check Email Logs:**
```
✅ Email sent to test@example.com successfully
```

---

## API Reference

### Reminder-Related Endpoints

#### Create Task with Reminders
```
POST /api/tasks
Headers:
  Authorization: Bearer <token>
  x-user-timezone: America/New_York
Body:
{
  "title": "Task title",
  "description": "Task description",
  "deadline": "2025-12-15T17:00:00Z",
  "reminders": [
    {
      "remindBefore": 24,
      "type": "one-time"
    }
  ]
}

Response:
{
  "id": 123,
  "title": "Task title",
  "deadline": "2025-12-15T17:00:00Z",
  "reminders": [
    {
      "type": "one-time",
      "remindAt": "2025-12-14T17:00:00.000Z",
      "sent": false,
      "lastSentAt": null
    }
  ]
}
```

#### Update Task Reminders
```
PUT /api/tasks/:id
Headers:
  Authorization: Bearer <token>
  x-user-timezone: America/New_York
Body:
{
  "reminders": [
    {
      "remindBefore": 48,
      "type": "one-time"
    }
  ]
}
```

#### AI Generate Task with Reminders
```
POST /api/ai/chat
Headers:
  Authorization: Bearer <token>
  x-user-timezone: America/New_York
Body:
{
  "prompt": "Create a task to submit report next Friday. Remind me 2 days before."
}

Response:
{
  "title": "Submit report",
  "deadline": "2025-12-13T17:00:00Z",
  "reminders": [
    {
      "type": "one-time",
      "remindAt": "2025-12-11T17:00:00.000Z",
      "sent": false,
      "lastSentAt": null
    }
  ]
}
```

#### Trigger Cron Job
```
GET /api/auth/cronrun
Headers:
  x-cron-secret: YOUR_SECRET
OR
Query:
  ?secret=YOUR_SECRET

Response:
{
  "success": true,
  "message": "Cron job executed successfully",
  "timestamp": "2025-12-05T15:30:00.000Z",
  "executionTime": "1234ms",
  "remindersSent": 5
}
```

### Reminder Object Schema

**Backend Format (Stored in Database):**
```typescript
interface Reminder {
  type: 'one-time' | 'daily' | 'weekly';

  // For one-time reminders
  remindAt?: string; // ISO 8601 UTC

  // For recurring reminders
  intervalHours?: 24 | 168;

  // Status
  sent: boolean;
  lastSentAt: string | null; // ISO 8601 UTC
}
```

**Frontend Format (User Input):**
```typescript
interface FrontendReminder {
  type: 'one-time' | 'daily' | 'weekly';

  // Legacy format (converted to remindAt)
  remindBefore?: number; // Hours before deadline

  // New format
  remindAt?: string; // ISO 8601
  customDate?: string; // ISO 8601 in user's timezone
}
```

---

## Troubleshooting

### Problem: Reminders Not Sending

**Check 1: Cron Job Running?**
```bash
# Check cronjob.org dashboard
# Last execution time should be within 5 minutes
```

**Check 2: Backend Logs**
```bash
vercel logs --follow
# Look for: "🔄 Cron job triggered"
```

**Check 3: Task Has Future Deadline?**
```sql
SELECT * FROM tasks WHERE deadline > NOW() AND status != 'completed';
```

**Check 4: Reminder Not Sent Yet?**
```sql
SELECT reminders FROM tasks WHERE id = 123;
-- Check: sent = false
```

**Check 5: Reminder Time Passed?**
```javascript
// remindAt should be <= current time
const remindAt = new Date("2025-12-14T17:00:00Z");
const now = new Date();
console.log(now >= remindAt); // Should be true
```

---

### Problem: Wrong Reminder Time

**Check 1: Timezone Header Sent?**
```javascript
// In browser console
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
// Should match header sent to API
```

**Check 2: Deadline in UTC?**
```sql
SELECT deadline FROM tasks WHERE id = 123;
-- Should end with Z (UTC)
```

**Check 3: remindAt Calculation**
```javascript
// 24 hours before deadline
const deadline = new Date("2025-12-15T17:00:00Z");
const remindAt = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
console.log(remindAt.toISOString());
// Expected: "2025-12-14T17:00:00.000Z"
```

---

### Problem: Duplicate Emails

**Check 1: Cron Running Too Frequently?**
```
# Should be every 5 minutes, not less
*/5 * * * *
```

**Check 2: Reminder Marked as Sent?**
```sql
SELECT reminders FROM tasks WHERE id = 123;
-- After first email, sent should be true
```

**Check 3: Multiple Cron Jobs?**
```
# Check cronjob.org dashboard
# Should have only 1 active job for this endpoint
```

---

### Problem: AI Not Creating Reminders

**Check 1: Deadline Provided?**
```javascript
// Reminders require deadline
if (!aiTask.deadline) {
  // No reminders will be created
}
```

**Check 2: AI Response Format**
```json
// Check backend logs for AI response
{
  "reminders": [
    { "remindBefore": 24, "type": "one-time" }
  ]
}
```

**Check 3: Normalization Errors**
```bash
# Look for warnings in logs
"Invalid customDate: ..."
"Error creating one-time reminder: ..."
```

---

### Problem: Cron Endpoint Returns 401

**Check 1: Secret Matches?**
```bash
# Backend .env
CRON_SECRET=abc123

# Request header
x-cron-secret: abc123

# OR query parameter
?secret=abc123
```

**Check 2: Environment Variable Loaded?**
```javascript
// In backend
console.log('CRON_SECRET:', process.env.CRON_SECRET);
// Should not be undefined
```

**Check 3: Header Format**
```bash
# Correct
curl -H "x-cron-secret: abc123" ...

# Wrong (will be ignored)
curl -H "Authorization: abc123" ...
```

---

### Problem: Email Not Received

**Check 1: Email Service Configured?**
```bash
# .env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Check 2: Nodemailer Logs**
```bash
# Look for:
✅ Email sent to user@example.com successfully
# OR
❌ Email sending error: ...
```

**Check 3: Spam Folder**
```
Check user's spam/junk folder
From: noreply@taskmanager.com
```

**Check 4: User Email Valid?**
```sql
SELECT email FROM users WHERE id = (
  SELECT "userId" FROM tasks WHERE id = 123
);
```

---

## Performance & Scalability

### Current Performance

- **Cron Execution Time:** ~500-2000ms (depends on # of tasks)
- **Database Query:** ~50-100ms (indexed deadline + status)
- **Email Sending:** ~200-500ms per email
- **Total Capacity:** ~50-100 reminders per execution

### Optimization Strategies

**If Scaling Beyond 1000 Users:**

1. **Batch Email Sending:**
```javascript
// Instead of await per email
const emailPromises = tasks.map(task => sendEmail(task));
await Promise.all(emailPromises);
```

2. **Pagination:**
```javascript
// Process in chunks
const CHUNK_SIZE = 100;
for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
  const chunk = tasks.slice(i, i + CHUNK_SIZE);
  await processChunk(chunk);
}
```

3. **Caching:**
```javascript
// Cache ready reminders for 1 minute
const cacheKey = `ready_reminders_${taskId}`;
```

4. **Database Indexing:**
```sql
CREATE INDEX idx_deadline_status
ON tasks(deadline, status)
WHERE deadline > NOW();
```

---

## Conclusion

The Task Manager reminder system is now:

✅ **Fully Tested** - 244 tests passing
✅ **Simplified** - Single source of truth (reminderHelpers.js)
✅ **Reliable** - Handles edge cases, timezones, deduplication
✅ **Scalable** - External cron, serverless-compatible
✅ **AI-Powered** - Intelligent reminder suggestions
✅ **User-Friendly** - Timezone-aware, flexible options

**Questions?** Check the troubleshooting section or review test files for examples.

**Need Help?** All code is documented inline with JSDoc comments.

---

**Document Version:** 2.0.0
**Last Updated:** December 5, 2025
**Test Coverage:** 244/244 tests passing ✅
