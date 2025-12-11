# Recent Updates

## Timezone Support & Email Template Redesign

### Features Added

1. **User Timezone Management**
   - Auto-detect timezone from browser
   - Manual timezone selection in Edit Profile (40+ timezones)
   - Display timezone in Profile Overview
   - Email reminders show deadlines in user's local time

2. **Email Template Redesign**
   - Matches frontend TaskCard UI exactly
   - Status-colored strip and icons
   - Responsive design with dark mode support
   - Bootstrap Icons integration

### Database Changes

**Migration Required**:
```bash
psql -h localhost -U postgres -d task_manager -f Backend/migrations/add_timezone_to_users.sql
```

This adds the `timezone` column to the Users table (default: 'UTC').

### Files Modified

**Backend**:
- `models/User.js` - Added timezone field
- `controllers/profileController.js` - Timezone handling & auto-detection
- `utils/cronJobs.js` - Status colors, icons, timezone formatting
- `templates/taskReminder.ejs` - Complete redesign

**Frontend**:
- `services/api.js` - Auto-send timezone header
- `components/profile/EditProfile.js` - Timezone dropdown
- `components/profile/ProfileOverview.js` - Display timezone

### Testing

**Backend**: `node test-email-template.js` (generates email preview)
**Migration**: See `migrations/README.md`

---

**Last Updated**: 2025-12-11
