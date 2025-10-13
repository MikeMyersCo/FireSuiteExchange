# 🔥 Fire Suite Exchange - Complete Setup Guide

This guide will walk you through completing the Fire Suite Exchange platform.

## ✅ What's Already Built

### Core Infrastructure (100% Complete)
- ✅ Next.js 14 project scaffolding with TypeScript
- ✅ Tailwind CSS configuration
- ✅ Docker & Docker Compose setup
- ✅ ESLint & Prettier configuration
- ✅ All environment variables configured

### Database Layer (100% Complete)
- ✅ Comprehensive Prisma schema with all models:
  - User (with roles: GUEST, SELLER, ADMIN)
  - Suite (all 130 suites across 3 areas)
  - SellerApplication (with statuses and workflow)
  - Listing (with images, pricing, contact methods)
  - ListingImage
  - Message (for internal messaging)
  - AuditEvent (compliance tracking)
  - NotificationPref
  - PasswordResetToken
- ✅ Database seed script (creates 130 suites + sample data)

### Authentication & Authorization (100% Complete)
- ✅ NextAuth.js v5 configuration
- ✅ Credentials provider with bcrypt password hashing
- ✅ Role-based authentication (GUEST, SELLER, ADMIN)
- ✅ Middleware for route protection
- ✅ Session management with JWT

### Validation & Type Safety (100% Complete)
- ✅ Zod schemas for all inputs:
  - Auth (login, register, password reset)
  - Seller applications
  - Listings (create, update, search)
  - Messages
- ✅ TypeScript types for all models
- ✅ Type-safe API responses

### Services & Utilities (100% Complete)
- ✅ Email service with Nodemailer
- ✅ Email templates for all notifications:
  - Welcome email
  - Application received/approved/denied
  - Listing published
  - Password reset
  - New messages
- ✅ Audit logging service
- ✅ Utility functions (formatting, slugs, validation)
- ✅ Constants file (suite areas, delivery methods, etc.)

### Documentation (100% Complete)
- ✅ Comprehensive README with setup instructions
- ✅ This setup guide
- ✅ Environment variable examples

## 🚧 What Needs to Be Completed

### Phase 1: UI Components (Required)

Create shadcn/ui components in `src/components/ui/`:

```bash
# Use shadcn-ui CLI to add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
```

Or manually create these components following shadcn/ui patterns.

### Phase 2: App Structure & Layouts

#### 2.1 Root Layout (`src/app/layout.tsx`)

```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fire Suite Exchange | Ford Amphitheater Tickets',
  description: 'Verified ticket exchange for Ford Amphitheater Fire Suite owners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

#### 2.2 Navigation Component (`src/components/navigation.tsx`)

Create a responsive navbar with:
- Logo/brand
- Navigation links (Browse, Sell, Admin)
- User menu (Login/Register or Profile/Logout)
- Mobile menu

### Phase 3: API Routes

Create these API route handlers in `src/app/api/`:

#### 3.1 Authentication Routes

- `api/auth/[...nextauth]/route.ts` - NextAuth handler
- `api/auth/register/route.ts` - User registration
- `api/auth/forgot-password/route.ts` - Password reset request
- `api/auth/reset-password/route.ts` - Password reset confirmation

#### 3.2 Application Routes

- `api/applications/route.ts` - Submit application (POST), get my applications (GET)
- `api/admin/applications/route.ts` - List all applications (GET, admin only)
- `api/admin/applications/[id]/route.ts` - Approve/deny application (PATCH, admin only)

#### 3.3 Listing Routes

- `api/listings/route.ts` - Browse listings (GET), create listing (POST)
- `api/listings/[id]/route.ts` - Get/update/delete listing
- `api/listings/[id]/mark-sold/route.ts` - Mark listing as sold
- `api/listings/[id]/images/route.ts` - Upload images

#### 3.4 Admin Routes

- `api/admin/users/route.ts` - User management
- `api/admin/audit-events/route.ts` - Audit log
- `api/admin/listings/[id]/route.ts` - Moderate listings

### Phase 4: Public Pages

#### 4.1 Landing Page (`src/app/page.tsx`)

Create with:
- Hero section with search
- "Browse by Area" tiles (North Terrace, South Terrace, Lower Fire)
- Featured listings
- How it works section
- Call-to-action

#### 4.2 Browse Page (`src/app/browse/page.tsx`)

- Listings grid
- Filters sidebar (area, suite, date, price, seats)
- Sort dropdown (date, price, newest)
- Pagination
- Mobile-friendly filters

#### 4.3 Listing Detail (`src/app/listings/[slug]/page.tsx`)

- Event details
- Suite information with seating map
- Pricing and availability
- Seller contact methods
- Image gallery
- Message seller form (if feature enabled)

### Phase 5: Authentication Pages

#### 5.1 Login (`src/app/login/page.tsx`)

- Email/password form
- Remember me checkbox
- Forgot password link
- Register link

#### 5.2 Register (`src/app/register/page.tsx`)

- Email, password, name, phone fields
- Password strength indicator
- Terms acceptance
- Redirect to login after success

#### 5.3 Forgot Password (`src/app/forgot-password/page.tsx`)

- Email input
- Send reset email
- Success message

#### 5.4 Reset Password (`src/app/reset-password/page.tsx`)

- Token validation
- New password form
- Redirect to login after success

### Phase 6: Seller Portal

#### 6.1 Seller Application (`src/app/apply-seller/page.tsx`)

- Legal name, suite area, suite number
- Phone, email
- Proof of ownership (file upload or text)
- Invite code (if feature enabled)
- Application status display

#### 6.2 Create Listing (`src/app/sell/new/page.tsx`)

- Event title, date/time
- Quantity, price per seat
- Delivery method
- Contact methods (email, phone, link)
- Notes
- Image upload
- Save as draft or publish

#### 6.3 My Listings (`src/app/sell/my-listings/page.tsx`)

- Table of all listings
- Edit, mark sold, withdraw actions
- Filters (status, date)

### Phase 7: Admin Dashboard

#### 7.1 Dashboard Home (`src/app/admin/page.tsx`)

- Stats overview (pending applications, active listings)
- Recent activity
- Quick actions

#### 7.2 Applications (`src/app/admin/applications/page.tsx`)

- Table of all applications
- Filter by status
- Approve/deny with notes
- View attached documents

#### 7.3 Listings (`src/app/admin/listings/page.tsx`)

- All listings table
- Moderate (approve/reject)
- Feature listings
- Bulk actions

#### 7.4 Users (`src/app/admin/users/page.tsx`)

- User table
- Change roles
- Lock/unlock accounts
- Reset 2FA

#### 7.5 Audit Log (`src/app/admin/audit-events/page.tsx`)

- Searchable audit log
- Filter by action, actor, date
- Export functionality

### Phase 8: Custom Components

#### 8.1 SeatingMap (`src/components/seating/seating-map.tsx`)

Create an interactive SVG or canvas-based seating map:
- Display all three areas (North Terrace, South Terrace, Lower Fire)
- Highlight specific suite
- Show capacity (8 seats)
- Color-code by area

#### 8.2 ListingCard (`src/components/listings/listing-card.tsx`)

- Event title, date
- Suite info with badge
- Price per seat
- Quantity available
- Delivery method icon
- Click to view details

#### 8.3 FileUpload (`src/components/file-upload.tsx`)

- Drag-and-drop or click to upload
- Image preview
- File size/type validation
- Multiple file support
- Progress indicator

### Phase 9: File Upload Handler

Create `src/lib/uploads.ts` for handling file uploads:

```typescript
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const filename = `${randomBytes(16).toString('hex')}-${file.name}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}
```

For production, integrate S3, Cloudinary, or similar.

### Phase 10: Legal Pages

#### 10.1 Terms of Service (`src/app/legal/terms/page.tsx`)
#### 10.2 Privacy Policy (`src/app/legal/privacy/page.tsx`)

Create placeholder legal pages or use a service like Termly.

### Phase 11: Testing

Create E2E tests in `tests/e2e/`:

#### 11.1 Seller Flow (`tests/e2e/seller-flow.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test('complete seller flow', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('[name="email"]', 'newse

ller@test.com');
  // ... complete registration

  // Apply for seller
  await page.goto('/apply-seller');
  // ... submit application

  // Admin approves (login as admin)
  // ... approve application

  // Create listing
  // ... create and publish listing

  // Verify listing appears in browse
  await page.goto('/browse');
  await expect(page.getByText('My Event')).toBeVisible();
});
```

#### 11.2 Browse Flow
#### 11.3 Admin Flow

### Phase 12: Enhancements

- [ ] Add rate limiting middleware
- [ ] Implement internal messaging (if feature enabled)
- [ ] Add 2FA support (if feature enabled)
- [ ] Create analytics dashboard
- [ ] Add listing expiration cron job
- [ ] Implement search with Algolia or similar
- [ ] Add image optimization with next/image
- [ ] Create OpenGraph meta tags for listings
- [ ] Add sitemap generation
- [ ] Implement RSS feed for new listings

## 🎯 Quick Start Checklist

1. ✅ Navigate to project: `cd /Users/mikemyers/dev/fire-suite-exchange`
2. ⬜ Install dependencies: `npm install`
3. ⬜ Start Docker services: `docker-compose up -d`
4. ⬜ Copy env file: `cp .env.example .env`
5. ⬜ Generate Prisma client: `npm run db:generate`
6. ⬜ Push schema to database: `npm run db:push`
7. ⬜ Seed database: `npm run db:seed`
8. ⬜ Add UI components: `npx shadcn-ui@latest add button card input...`
9. ⬜ Create root layout and navigation
10. ⬜ Implement API routes (start with auth)
11. ⬜ Build landing page
12. ⬜ Create browse page
13. ⬜ Build listing detail page
14. ⬜ Implement auth pages
15. ⬜ Create seller portal
16. ⬜ Build admin dashboard
17. ⬜ Test complete user flows

## 💡 Development Tips

### Use shadcn/ui CLI

The easiest way to add components:

```bash
npx shadcn-ui@latest init  # Initialize (accept defaults)
npx shadcn-ui@latest add button  # Add specific component
```

### Database Development

Always run migrations when changing schema:

```bash
npm run db:push  # For development
npm run db:migrate  # For production-ready migrations
```

### Email Testing

Check MailHog at http://localhost:8025 to see all sent emails during development.

### API Development

Use tools like:
- Postman or Insomnia for API testing
- Prisma Studio (`npm run db:studio`) for database inspection
- Next.js API route logs in terminal

### Component Development

Start with the smallest, most reusable components:
1. UI primitives (button, input, card)
2. Composite components (forms, cards with data)
3. Page-level components (full features)

## 🔧 Debugging

### Common Issues

**Prisma Client not found**:
```bash
npm run db:generate
```

**Database connection error**:
```bash
docker-compose ps  # Check if DB is running
docker-compose logs db  # Check DB logs
```

**Next.js build errors**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Email not sending**:
- Check MailHog is running at http://localhost:8025
- Verify SMTP_HOST in .env matches docker-compose service name

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)

## 🎉 Next Steps

1. Install all dependencies
2. Start Docker services
3. Seed the database
4. Add shadcn/ui components
5. Build the landing page to visualize the design
6. Implement authentication pages
7. Create API routes incrementally
8. Test as you build

**Good luck building Fire Suite Exchange!** 🔥
