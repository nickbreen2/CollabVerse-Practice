# CollabLink MVP - Auth + Dashboard

A Next.js application for creators to build their collaboration profiles with authentication, dashboard, and store customization features.

## Features

### ✅ Authentication
- **Sign Up** with email, password, and unique handle (with locked prefix `collabl.ink/`)
- **Sign In** with email and password
- Secure session management using iron-session
- Reserved handle validation
- Password hashing with bcryptjs

### ✅ Dashboard
- **My Store Tab**: Full store customization with Preview/Edit toggle
  - Preview mode: View your store as it appears to visitors
  - Edit mode: Right-side panel with Content and Design tabs
- **Collabs Tab**: Placeholder for future collaboration features
- **Analytics Tab**: Placeholder for future analytics features
- Left navigation with sign-out functionality

### ✅ Store Customization

#### Content Panel
- Profile image upload (circle crop, ≤2MB)
- Display name (1-50 characters)
- Location (1-60 characters)
- Bio (up to 280 characters)
- Social media links (TikTok, Instagram, YouTube, Snapchat)
- Content categories (select up to 5 from 12 options)
- **Optimistic save** with 400ms debounce

#### Design Panel
- Background image upload (≤2MB)
- Light/Dark theme toggle
- **Gradient fade effect**: Banner image smoothly fades into base color
- Real-time preview of gradient effect

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: iron-session
- **File Storage**: AWS S3
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Package manager (npm, yarn, or pnpm)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/collabverse?schema=public"
   SESSION_SECRET="your-secret-key-here-at-least-32-characters-long"
   
   # AWS S3 Configuration (for image uploads)
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   ```

   **Important**: 
   - Replace the `DATABASE_URL` with your actual PostgreSQL connection string
   - Generate a secure random string for `SESSION_SECRET` (at least 32 characters)
   - See [AWS S3 Setup Instructions](#aws-s3-setup) below for configuring S3

3. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── store/         # Store CRUD endpoints
│   │   └── upload/        # Image upload endpoint
│   ├── auth/
│   │   ├── sign-in/       # Sign in page
│   │   └── sign-up/       # Sign up page
│   ├── dashboard/
│   │   ├── my-store/      # Store customization page
│   │   ├── collabs/       # Collabs placeholder
│   │   ├── analytics/     # Analytics placeholder
│   │   └── layout.tsx     # Dashboard layout with auth check
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Banner.tsx         # Banner with gradient fade
│   ├── ContentForm.tsx    # Content editing form
│   ├── DashboardNav.tsx   # Dashboard navigation
│   ├── DesignForm.tsx     # Design editing form
│   ├── EditPanel.tsx      # Right panel with tabs
│   ├── HandleInput.tsx    # Handle input with locked prefix
│   ├── StoreCardToggle.tsx # Preview/Edit toggle button
│   └── StorePreviewCard.tsx # Store preview component
├── hooks/
│   └── useDebounce.ts     # Debounce hook for optimistic saves
└── lib/
    ├── auth.ts            # Session management
    ├── prisma.ts          # Prisma client
    ├── utils.ts           # Utility functions
    └── validations.ts     # Zod schemas
```

## Database Schema

### User Model
- id (cuid)
- email (unique)
- passwordHash
- role (CREATOR | ADMIN)
- createdAt, updatedAt

### CreatorStore Model
- id (cuid)
- userId (unique, foreign key)
- handle (unique)
- displayName
- location
- bio
- avatarUrl
- bannerUrl
- theme (LIGHT | DARK)
- categories (array)
- social (JSON array)
- isPublished (boolean)
- createdAt, updatedAt

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create new user account
- `POST /api/auth/sign-in` - Sign in to existing account
- `POST /api/auth/sign-out` - Sign out current user

### Store
- `GET /api/store` - Get current user's store
- `PATCH /api/store` - Update store details

### Upload
- `POST /api/upload` - Upload images to AWS S3

## Validation Rules

### Handle
- 3-30 characters
- Lowercase only
- Letters, numbers, and hyphens
- Cannot start or end with hyphen
- Reserved handles: admin, api, login, signup, dashboard, collablink, www, auth, signin, signout

### Images
- Formats: JPG, PNG, WebP
- Max size: 2MB

### Content Fields
- Display Name: max 50 characters
- Location: max 60 characters
- Bio: max 280 characters
- Categories: max 5 selections
- Social URLs: must start with https://

## Key Features Implementation

### Locked-Prefix Handle Input
The handle input shows a non-editable prefix `collabl.ink/` followed by the user's custom handle.

### Preview/Edit Toggle
A button at the top-left of the store card switches between:
- **Preview Mode**: Shows the store as visitors see it
- **Edit Mode**: Reveals the right panel with Content and Design tabs

### Gradient Fade Effect
The banner image smoothly fades into the base color (white for Light theme, black for Dark theme) using CSS gradients:
- Top-to-bottom gradient overlay
- Adjustable opacity from 90% to transparent
- Real-time preview in Design tab

### Optimistic Saving
Form changes are automatically saved after 400ms of inactivity with visual feedback:
- Debounced API calls to reduce server load
- "Saved" indicator with checkmark
- Error handling with toast notifications

## Performance Targets

- **Time to View (TTV)**: User reaches `/dashboard/my-store` in ≤3s after sign-up
- **Save Latency**: Store updates complete in <300ms P95

## Development Notes

### AWS S3 Setup

This application uses AWS S3 for storing profile images and banner images. Follow these steps to set up S3:

#### 1. Create an AWS Account
If you don't have one, sign up at https://aws.amazon.com.

#### 2. Create an S3 Bucket
1. Go to the S3 service in AWS Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `collablink-uploads`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Block public access**: Enable this for security
6. Leave versioning disabled (unless you need it)
7. Click "Create bucket"

#### 3. Create IAM User and Access Keys
1. Go to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Enter a username (e.g., `collablink-s3-user`)
4. Click "Next"
5. Under "Set permissions", select "Attach policies directly"
6. Search for and select `AmazonS3FullAccess` (or create a custom policy with only the needed permissions)
7. Click "Next" and "Create user"
8. Click on the newly created user
9. Go to the "Security credentials" tab
10. Click "Create access key"
11. Choose "Application running outside AWS"
12. Click "Next" and "Create access key"
13. **Important**: Copy both the Access Key ID and Secret Access Key immediately (you won't be able to see the secret again)

#### 4. Configure Bucket CORS (for client-side access)
1. Go to your S3 bucket
2. Click on the "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and add this configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### 5. Configure Environment Variables
Add these to your `.env` file:
```env
AWS_REGION="us-east-1"  # Your bucket region
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

#### 6. Bucket Policy (Optional, if you need public URLs)
If you want uploaded images to be publicly accessible, add this bucket policy (replace `your-bucket-name`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### Important Notes
- **Security**: Never commit your AWS credentials to version control
- **Cost**: S3 has a free tier for the first 12 months (5GB storage, 20,000 GET requests)
- **File Organization**: Uploads are organized by user ID (`userId/filename.ext`)
- **File Limits**: Max 2MB per file, only JPG/PNG/WebP allowed

### Image Upload
The application uses AWS S3 for storing profile and banner images. The upload API supports:
- File size limit: 2MB
- Allowed formats: JPG, PNG, WebP
- Automatic file organization by user ID
- Secure uploads with authentication

### Future Enhancements (Out of Scope for MVP)
- Public store pages at `/:handle`
- Collaboration form for brands
- Email notifications (Brevo integration)
- Payment processing
- Publishing workflow
- Analytics tracking

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists and is accessible

### Session Issues
- Verify SESSION_SECRET is at least 32 characters
- Clear browser cookies and try again

### Image Upload Not Working
- Verify AWS credentials in `.env` file are correct
- Check that the S3 bucket exists and is accessible
- Ensure CORS is configured on your S3 bucket
- Verify file size is under 2MB and format is JPG/PNG/WebP

## License

This project is for demonstration purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

