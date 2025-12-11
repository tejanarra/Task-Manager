# Database Migrations

This folder contains SQL migration scripts for database schema changes.

## How to Run Migrations

### Manual Method (PostgreSQL)

1. Connect to your database:
```bash
psql -h localhost -U postgres -d task_manager
```

2. Run the migration script:
```bash
\i migrations/add_timezone_to_users.sql
```

Or using psql command line:
```bash
psql -h localhost -U postgres -d task_manager -f migrations/add_timezone_to_users.sql
```

### Using Environment Variables

If you have environment variables set:
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/add_timezone_to_users.sql
```

## Available Migrations

### add_timezone_to_users.sql
- **Date**: 2025-01-11
- **Purpose**: Add timezone column to Users table for personalized email reminders
- **Changes**:
  - Adds `timezone` VARCHAR(255) column with default value 'UTC'
  - Updates existing users to have 'UTC' timezone
  - Adds column comment

## Migration Status

After running each migration, mark it as completed:

- [x] `add_timezone_to_users.sql` - ⚠️ **Needs to be run manually**

## Notes

- This project doesn't use an ORM migration tool (like Sequelize migrations)
- Migrations must be run manually against the database
- Always backup your database before running migrations
- Test migrations in development environment first
