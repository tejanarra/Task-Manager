-- Migration: Add timezone column to Users table
-- Purpose: Store user timezone for personalized email reminders
-- Date: 2025-01-11

-- Add timezone column with default value of 'UTC'
ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS timezone VARCHAR(255) DEFAULT 'UTC';

-- Update existing users to have UTC timezone if NULL
UPDATE "Users"
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Add comment to column
COMMENT ON COLUMN "Users".timezone IS 'User timezone in IANA format (e.g., America/New_York, Europe/London, Asia/Tokyo)';
