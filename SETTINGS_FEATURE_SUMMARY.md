# Settings Feature - Visual Summary

## 🎯 Overview

A complete Settings experience with three main sections: **Personal Info**, **Connected Accounts**, and **Pause / Delete Account**. Accessible via the profile menu in the dashboard.

---

## 🎨 Entry Point: Profile Menu

### Location
Profile dropdown (bottom of left sidebar)

### Menu Structure
```
┌─────────────────────────┐
│  ⚙️  Settings           │
├─────────────────────────┤  ← Separator
│  🚪 Log out             │  ← Special styling
│     Background: #FFF1F1 │
│     Text: #FA0606       │
└─────────────────────────┘
```

---

## 📐 Settings Shell Layout

### Desktop View
```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                     │
│  ┌────────────────┐                                          │
│  │  🔍 Search     │                                          │
│  └────────────────┘                                          │
│                                                               │
│  ┌──────────────┐  ┌────────────────────────────────────┐  │
│  │              │  │                                     │  │
│  │ 👤 Personal  │  │  [Content Panel]                   │  │
│  │    Info      │  │                                     │  │
│  │              │  │  Personal Info Section              │  │
│  │ 🔗 Connected │  │  - About You                        │  │
│  │    Accounts  │  │  - Log In Information              │  │
│  │              │  │                                     │  │
│  │ ⚠️  Pause /   │  │  or                                │  │
│  │    Delete    │  │                                     │  │
│  │              │  │  Connected Accounts Section         │  │
│  └──────────────┘  │  - Provider cards                   │  │
│   Left Nav (280px) │                                     │  │
│                     │  or                                │  │
│                     │                                     │  │
│                     │  Danger Zone Section                │  │
│                     │  - Pause/Delete controls           │  │
│                     │                                     │  │
│                     └────────────────────────────────────┘  │
│                       Right Panel (scrollable, max-w-4xl)   │
└──────────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌────────────────────────┐
│  Settings              │
├────────────────────────┤
│                        │
│  [Content Panel]       │
│  (full width)          │
│                        │
│                        │
│  [Sections] ← Drawer   │
│  (Fixed bottom-left)   │
└────────────────────────┘
```

---

## 📋 Section 1: Personal Info

### About You Card
```
┌────────────────────────────────────────────────┐
│  About You                                     │
│  Update your personal information and username │
│                                                │
│  Name                                          │
│  ┌──────────────────────────────────────────┐ │
│  │ John Doe                                 │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Username (checking...)                        │
│  ┌──────────────────────────────────────────┐ │
│  │ @johndoe                                 │ │
│  └──────────────────────────────────────────┘ │
│  ✓ Username available                          │
│                                                │
│  Birth Date                                    │
│  ┌──────────────────────────────────────────┐ │
│  │ 1990-01-01                               │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Location                                      │
│  ┌──────────────────────────────────────────┐ │
│  │ New York, NY                             │ │
│  └──────────────────────────────────────────┘ │
│  Where you're based                            │
│                                                │
│                         [Save Changes] ←─────┐ │
│                         (Disabled until valid) │
└────────────────────────────────────────────────┘
```

**Validation:**
- Username: 3-20 chars, lowercase, letters/numbers/underscores
- Real-time uniqueness check
- Birth Date: Cannot be in the future
- Inline error messages

### Log In Information Card
```
┌────────────────────────────────────────────────┐
│  Log In Information                            │
│  Manage your email and password                │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  📧  Email Address                       │ │
│  │      user@example.com                    │ │
│  │                      [Change Email] ───┐ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🔑  Password                            │ │
│  │      ••••••••                            │ │
│  │                   [Change Password] ───┐ │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Dialogs:**

**Change Email Dialog:**
```
┌──────────────────────────────────┐
│  Change Email Address         ✕  │
│                                  │
│  Enter your new email address.   │
│  We'll send a verification link. │
│                                  │
│  New Email Address               │
│  ┌────────────────────────────┐  │
│  │ new@example.com            │  │
│  └────────────────────────────┘  │
│                                  │
│           [Cancel] [Send Ver...] │
└──────────────────────────────────┘
```

**Change Password Dialog:**
```
┌──────────────────────────────────┐
│  Change Password              ✕  │
│                                  │
│  Must be ≥8 chars with 1 letter  │
│  and 1 number.                   │
│                                  │
│  Current Password                │
│  ┌────────────────────────────┐  │
│  │ ••••••••                   │  │
│  └────────────────────────────┘  │
│                                  │
│  New Password                    │
│  ┌────────────────────────────┐  │
│  │ ••••••••                   │  │
│  └────────────────────────────┘  │
│                                  │
│  Confirm New Password            │
│  ┌────────────────────────────┐  │
│  │ ••••••••                   │  │
│  └────────────────────────────┘  │
│                                  │
│        [Cancel] [Update Pass...] │
└──────────────────────────────────┘
```

---

## 🔗 Section 2: Connected Accounts

**UI-Only Implementation** (No real integrations yet)

```
┌────────────────────────────────────────────────┐
│  Connected Accounts                            │
│  Link your accounts for easier sign-in         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🔴 G  Google                            │ │
│  │        Connect your Google account       │ │
│  │                          [Connect] ────┐ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🔵 F  Facebook                          │ │
│  │        Connect your Facebook account     │ │
│  │                          [Connect] ────┐ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ⚫ X  Twitter / X                       │ │
│  │        Connect your Twitter account      │ │
│  │                          [Connect] ────┐ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ⚫ G  GitHub                            │ │
│  │        Connect your GitHub account       │ │
│  │                          [Connect] ────┐ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌────────────────────────────────────────┐   │
│  │ ℹ️  Note: You'll be able to link       │   │
│  │    accounts here once integrations are │   │
│  │    live. Disconnecting won't be        │   │
│  │    possible until fully implemented.   │   │
│  └────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Behavior:**
- All buttons show toast: "Connected Accounts will be enabled once integrations are available."
- No actual OAuth or API calls

---

## ⚠️ Section 3: Danger Zone

### Normal State (Active Account)
```
┌────────────────────────────────────────────────┐
│  ⚠️  Danger Zone                               │
│     Manage your account status and deletion    │
│                                                │
│     Are you sure you want to delete your       │
│              account?                          │
│                                                │
│     Your account will be deactivated for       │
│              30 days.                          │
│                                                │
│     After 30 days, your account will be        │
│         permanently deleted.                   │
│                                                │
│                                                │
│      [Pause Account]  [Delete Account]         │
│                        ↑ Red gradient          │
└────────────────────────────────────────────────┘
```

### Paused State
```
┌────────────────────────────────────────────────┐
│  ⚠️  Danger Zone                               │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🕐 Account Paused                       │ │
│  │                                          │ │
│  │  Your storefront is hidden and you      │ │
│  │  cannot receive new collaboration       │ │
│  │  requests.                               │ │
│  │                                          │ │
│  │  [Reactivate Account]                   │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Pending Deletion State
```
┌────────────────────────────────────────────────┐
│  ⚠️  Danger Zone                               │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ❌ Scheduled for Deletion               │ │
│  │                                          │ │
│  │  Your account will be permanently        │ │
│  │  deleted in 28 days (10/18/2025).       │ │
│  │                                          │ │
│  │  During this time, your account is       │ │
│  │  deactivated. You can cancel deletion   │ │
│  │  anytime before the deadline.            │ │
│  │                                          │ │
│  │  [Cancel Deletion]                       │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Delete Account Dialog
```
┌──────────────────────────────────┐
│  Delete Account               ✕  │
│                                  │
│  This action will schedule your  │
│  account for deletion in 30 days.│
│  You can cancel anytime.         │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ⚠️ Warning: After 30 days, │  │
│  │    all your data will be   │  │
│  │    permanently deleted.    │  │
│  └────────────────────────────┘  │
│                                  │
│  Confirm Password                │
│  ┌────────────────────────────┐  │
│  │ ••••••••                   │  │
│  └────────────────────────────┘  │
│                                  │
│     [Cancel] [Schedule Deletion] │
│               ↑ Red gradient     │
└──────────────────────────────────┘
```

---

## 🔄 Account Status Flow

```
┌─────────┐
│ ACTIVE  │ ←──────────────────┐
└────┬────┘                    │
     │                         │
     ├─ Pause ─────→ ┌────────┴─────┐
     │               │    PAUSED    │
     │               └──────────────┘
     │                      │
     │                Reactivate
     │
     ├─ Delete ────→ ┌──────────────────────┐
     │               │ PENDING_DELETION     │
     │               │ (30-day window)      │
     │               └─────────┬────────────┘
     │                         │
     │              Cancel ────┤
     │              Deletion   │
     │                         │
     └─────────────────────────┘
                               │
                    After 30 days
                               │
                               ↓
                        ┌──────────┐
                        │ DELETED  │
                        └──────────┘
```

---

## 🎨 Visual Design System

### Colors
- **Primary Action**: Standard button (blue/teal)
- **Secondary Action**: Outline button
- **Danger Action**: Red gradient (`from-red-600 to-red-500`)
- **Log out Background**: `#FFF1F1` (light red)
- **Log out Text**: `#FA0606` (red)
- **Success/Info Banners**: Blue/Green backgrounds
- **Warning Banners**: Yellow background
- **Danger Banners**: Red background

### Icons
- **Personal Info**: 👤 User
- **Connected Accounts**: 🔗 Link2
- **Danger Zone**: ⚠️ AlertTriangle
- **Settings**: ⚙️ Settings
- **Email**: 📧 Mail
- **Password**: 🔑 Key
- **Clock/Time**: 🕐 Clock
- **Delete**: ❌ XCircle

### Spacing
- Compact, breathable padding
- Card-based layout with borders
- Consistent 24px section spacing
- Mobile-friendly touch targets

### Feedback
- **Loading**: Spinner icons in buttons
- **Success**: Green toast with checkmark
- **Error**: Red toast with error icon
- **Info**: Blue toast with info icon

---

## 🧪 User Flows

### 1. Change Username
1. Navigate to Settings → Personal Info
2. Edit username field
3. See real-time validation (format + uniqueness)
4. Save button enables when valid
5. Click "Save Changes"
6. See success toast
7. Page remains on same section

### 2. Change Password
1. Navigate to Settings → Personal Info
2. Click "Change Password" button
3. Dialog opens
4. Enter current password
5. Enter new password (validated)
6. Confirm new password
7. Click "Update Password"
8. See success toast
9. Dialog closes

### 3. Delete Account (30-Day Flow)
1. Navigate to Settings → Pause / Delete
2. Click "Delete Account"
3. Dialog opens with warning
4. Enter password to confirm
5. Click "Schedule Deletion"
6. Account status → PENDING_DELETION
7. Countdown banner appears
8. User has 30 days to cancel
9. After 30 days: Backend job deletes account

### 4. Cancel Deletion
1. While in PENDING_DELETION state
2. See countdown banner
3. Click "Cancel Deletion"
4. Account status → ACTIVE
5. See success toast
6. Banner disappears

---

## 📱 Mobile Responsiveness

### Key Features
- Full-width content panel on mobile
- "Sections" drawer replaces left nav
- All dialogs work on small screens
- Touch-friendly button sizes
- No horizontal scrolling
- Sticky mobile header with title

### Breakpoints
- Desktop: `lg:` (1024px+)
- Mobile: < 1024px

---

## ✅ Testing Checklist

- [ ] Settings menu item appears in profile dropdown
- [ ] Log out has red styling (#FFF1F1 bg, #FA0606 text)
- [ ] Desktop two-column layout renders correctly
- [ ] Mobile drawer navigation works
- [ ] Search filters sections correctly
- [ ] All Personal Info validations work
- [ ] Username uniqueness check works
- [ ] Email change dialog opens and sends verification
- [ ] Password change validates and updates
- [ ] Connected Accounts shows "coming soon" toast
- [ ] Pause account works and shows banner
- [ ] Reactivate account works
- [ ] Delete account schedules 30-day deletion
- [ ] Countdown displays correctly
- [ ] Cancel deletion restores account
- [ ] All toasts display properly
- [ ] No console errors
- [ ] Mobile responsiveness works

---

## 🚀 Quick Start

1. **Run migration:**
   ```bash
   npx prisma migrate dev --name add_settings_fields
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Access Settings:**
   - Sign in to dashboard
   - Click profile avatar (bottom left)
   - Click "Settings"

4. **Test features:**
   - Update personal info
   - Try changing password
   - Check Connected Accounts message
   - Test pause/delete flows

---

## 📚 Documentation

- **Full Setup Guide**: See `SETTINGS_SETUP.md`
- **API Documentation**: See inline comments in `/api/settings/*` routes
- **Component Docs**: See JSDoc comments in component files

---

## 🎯 Success Criteria (All Met ✅)

- ✅ Settings accessible via profile menu
- ✅ Log out styled with red colors
- ✅ Two-column responsive layout
- ✅ Personal Info with full validation
- ✅ Email + Password change flows
- ✅ Connected Accounts UI-only implementation
- ✅ Pause/Delete with 30-day window
- ✅ Countdown display for pending deletion
- ✅ Cancel deletion functionality
- ✅ All dialogs and confirmations
- ✅ Mobile-responsive design
- ✅ Compact, polished UI
- ✅ Comprehensive API routes
- ✅ No linting errors

