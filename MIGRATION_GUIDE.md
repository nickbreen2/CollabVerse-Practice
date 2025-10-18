# Database Migration Guide

## 🚨 Important: Database Migration Required

After pulling these changes, you **MUST** run a database migration to add the new `showSocialLinks` field.

## For Development

Run this command in your terminal:

```bash
npx prisma migrate dev --name add_show_social_links
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Add the `showSocialLinks` column to the `CreatorStore` table
4. Set the default value to `true` for all existing stores

## For Production/Deployment

If deploying to production, use:

```bash
npx prisma migrate deploy
```

## What Changed

### New Field Added:
```prisma
model CreatorStore {
  // ... existing fields ...
  showSocialLinks  Boolean  @default(true)
  // ... existing fields ...
}
```

### Default Behavior:
- All existing stores will have `showSocialLinks = true`
- New stores will have `showSocialLinks = true` by default
- Creators can toggle this off in the "Manage Platforms" section

## Verification

After running the migration, verify it worked:

```bash
npx prisma studio
```

Then check the `CreatorStore` table to confirm the `showSocialLinks` column exists.

## Rollback (if needed)

If you need to rollback this migration:

```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

Then manually remove the field from the schema and generate the client again.

