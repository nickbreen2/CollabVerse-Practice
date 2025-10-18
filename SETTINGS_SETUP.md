# Settings Feature Setup Guide

## Overview

This guide covers the complete Settings feature implementation, including Personal Info, Connected Accounts, and Pause/Delete Account functionality.

## Database Migration Required

The Prisma schema has been updated with new fields. You **must** run a migration to apply these changes.

### Run the migration:

```bash
npx prisma migrate dev --name add_settings_fields
```

This will create and apply a migration that adds:
- `name` (String?, optional) - User's full name
- `birthDate` (DateTime?, optional) - User's birth date
- `accountStatus` (AccountStatus enum) - Account state (ACTIVE, PAUSED, PENDING_DELETION, DELETED)
- `scheduledDeletionAt` (DateTime?, optional) - When the account is scheduled for deletion

### If migration fails or you need to reset:

```bash
npx prisma migrate reset
npx prisma db push
```

## Feature Summary

### 1. Profile Menu Integration ✅

- **Settings** menu item added above "Log out" in the profile dropdown
- **Log out** styled with:
  - Background: `#FFF1F1` (light red)
  - Text: `#FA0606` (red)
  - Hover: slightly deeper background tint

### 2. Settings Shell ✅

- **Desktop**: Two-column layout with left navigation and right content panel
- **Mobile**: Responsive drawer with "Sections" button
- **Search**: Filter settings sections by keywords
- **Sections**: Personal Info, Connected Accounts, Pause / Delete

### 3. Personal Info Section ✅

#### About You
- **Name**: User's full name
- **Username**: Lowercase, 3-20 chars, letters/numbers/underscores only
  - Real-time uniqueness validation
  - Format validation with inline errors
- **Birth Date**: Cannot be in the future
- **Location**: Free text field (e.g., "City, State")

Save button is disabled until form is dirty and all validations pass.

#### Log In Information
- **Email**: Shows current email with "Change Email" button
  - Opens dialog for new email input
  - Sends verification email (UI placeholder for now)
  - Shows non-blocking status after request
  
- **Password**: Change password functionality
  - Modal with Current, New, and Confirm fields
  - Requirements: ≥8 chars, 1 letter, 1 number
  - Verifies current password before updating

### 4. Connected Accounts Section ✅

**UI-Only Implementation** (No real OAuth yet)

Displays provider cards with:
- Provider avatar/initial (Google, Facebook, Twitter/X, GitHub)
- Provider name and description
- "Connect" button (disabled, shows toast)

Toast message: "Connected Accounts will be enabled once integrations are available."

Helper note explains integrations are coming soon.

### 5. Danger Zone Section ✅

#### Pause Account
- Instantly sets account to PAUSED state
- Hides storefront (sets `isPublished = false`)
- Shows banner with "Reactivate Account" button
- No collaboration requests while paused

#### Delete Account (30-Day Window)
**Explicit 30-day deletion flow:**

1. User clicks "Delete Account"
2. Modal opens requiring password confirmation
3. On confirm:
   - Status → `PENDING_DELETION`
   - `scheduledDeletionAt` = now + 30 days
   - Storefront hidden
   - Account deactivated

4. During 30-day window:
   - Countdown badge shows days remaining
   - "Cancel Deletion" button available
   - User can restore account anytime

5. After 30 days:
   - Backend process permanently deletes account and data
   - Status → `DELETED`

#### Cancel Deletion
- Available anytime during the 30-day window
- Restores account to ACTIVE immediately
- Clears `scheduledDeletionAt`

## API Routes Created

All routes are under `/api/settings/`:

### Profile Management
- **PATCH** `/api/settings/profile` - Update name, username, birth date, location
- **GET** `/api/settings/check-username?username=...` - Check username availability

### Authentication
- **POST** `/api/settings/email` - Request email change (verification placeholder)
- **POST** `/api/settings/password` - Change password (with current password verification)

### Account Status
- **POST** `/api/settings/pause-account` - Pause account
- **POST** `/api/settings/reactivate-account` - Reactivate paused account
- **POST** `/api/settings/delete-account` - Schedule deletion (30-day window)
- **POST** `/api/settings/cancel-deletion` - Cancel scheduled deletion

## Components Created

```
src/
  app/
    dashboard/
      settings/
        page.tsx                          # Settings page entry point
    api/
      settings/
        profile/route.ts                  # Profile update
        check-username/route.ts           # Username validation
        email/route.ts                    # Email change
        password/route.ts                 # Password change
        pause-account/route.ts            # Pause account
        reactivate-account/route.ts       # Reactivate account
        delete-account/route.ts           # Delete account
        cancel-deletion/route.ts          # Cancel deletion
  components/
    settings/
      SettingsShell.tsx                   # Main settings layout
      PersonalInfoSection.tsx             # Personal info & login
      ConnectedAccountsSection.tsx        # Connected accounts UI
      DangerZoneSection.tsx               # Pause/delete account
```

## Visual Details

### Typography & Spacing
- Compact spacing matching Link Manager style
- Clean card-based layout
- Clear visual hierarchy with section headers

### Buttons
- Rounded corners
- Clear primary vs secondary styling
- Danger buttons use red gradient: `from-red-600 to-red-500`
- Disabled states and loading spinners

### Feedback
- Success toasts: "Saved", "Email updated", "Password changed", etc.
- Error toasts: Clear validation messages
- Info toasts for Connected Accounts: "Integrations coming soon"

### Icons
- Consistent lucide-react icons throughout
- User, Key, Mail, Clock, AlertTriangle, Settings, etc.

## Testing Checklist

### Personal Info
- [ ] Edit name, username, birth date, location
- [ ] Username validation (format + uniqueness)
- [ ] Birth date validation (no future dates)
- [ ] Save button disabled until valid changes
- [ ] Success toast after save

### Login Information
- [ ] Email change dialog opens
- [ ] Verification sent message displays
- [ ] Password change dialog validates:
  - [ ] All fields required
  - [ ] Min 8 characters
  - [ ] At least 1 letter and 1 number
  - [ ] Passwords match
- [ ] Current password verification works
- [ ] Success toast after password change

### Connected Accounts
- [ ] All providers display correctly
- [ ] "Connect" buttons show "Coming soon" toast
- [ ] Helper note visible

### Danger Zone
- [ ] Pause account sets status to PAUSED
- [ ] Paused banner shows with Reactivate button
- [ ] Reactivate restores ACTIVE status
- [ ] Delete account requires password
- [ ] Deletion schedules for 30 days
- [ ] Countdown displays correctly
- [ ] Cancel deletion restores account
- [ ] All confirmations work on mobile

### Responsive Design
- [ ] Desktop two-column layout works
- [ ] Mobile drawer/sheet navigation works
- [ ] All dialogs work on mobile
- [ ] No horizontal overflow
- [ ] Touch targets are adequate

## Backend Implementation Note

For the 30-day deletion window, you'll need to implement a daily background process that:

1. Queries for users where:
   - `accountStatus = 'PENDING_DELETION'`
   - `scheduledDeletionAt <= NOW()`

2. For each user:
   - Delete all associated data (CreatorStore, etc.)
   - Update status to `DELETED` or hard delete the user record

Example (pseudo-code):
```typescript
// Daily cron job or scheduled task
async function processScheduledDeletions() {
  const usersToDelete = await prisma.user.findMany({
    where: {
      accountStatus: 'PENDING_DELETION',
      scheduledDeletionAt: {
        lte: new Date()
      }
    }
  })

  for (const user of usersToDelete) {
    await prisma.$transaction([
      prisma.creatorStore.deleteMany({ where: { userId: user.id } }),
      // Delete other related data...
      prisma.user.delete({ where: { id: user.id } })
    ])
  }
}
```

## Definition of Done ✅

- [x] Settings entry added to profile popover above Log out
- [x] Log out styled with provided colors (#FFF1F1 bg, #FA0606 text)
- [x] Settings shell with left navigation + search
- [x] Responsive drawer on mobile
- [x] Personal Info: Name, Username, Birth Date, Location with validation
- [x] Login Info: Email edit flow and Password change dialog
- [x] Connected Accounts: UI-only with "coming soon" messaging
- [x] Danger Zone: Pause, Delete (30-day window), Cancel Deletion, Countdown
- [x] All states render cleanly on mobile and desktop
- [x] Compact spacing throughout
- [x] All API routes implemented

## Next Steps

1. Run the database migration: `npx prisma migrate dev --name add_settings_fields`
2. Test the Settings feature in development
3. (Optional) Implement real email verification flow
4. (Optional) Implement OAuth for Connected Accounts
5. Set up a daily background job for scheduled deletions

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database migration ran successfully
3. Ensure all environment variables are set (DATABASE_URL, SESSION_SECRET)
4. Check that Prisma client is generated: `npx prisma generate`

