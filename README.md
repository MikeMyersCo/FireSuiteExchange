# 🔥 Fire Suite Exchange

Production-ready ticket exchange platform for Ford Amphitheater Fire Suite owners in Colorado Springs.

## 🎯 Features

- **Multi-Role System**: Guest (buyers), Verified Sellers, and Admins
- **Seller Verification**: Application workflow with document upload and admin review
- **Ticket Listings**: Full CRUD with images, pricing, seat selection, and multiple contact methods
- **Advanced Search**: Filter by area, suite, date range, price, seats available, delivery method
- **Admin Dashboard**: Manage applications, moderate listings, view audit logs
- **Email Notifications**: Welcome emails, application updates, listing alerts
- **Audit Logging**: Track all critical actions for compliance
- **Seating Visualization**: Interactive seating maps showing suite locations
- **Mobile-First Design**: Responsive, accessible, Fortune 500-quality UI
- **Production-Ready**: Docker support, TypeScript, comprehensive validation, security best practices

## 📊 Suite Configuration

- **North Terrace**: Suites 1-20 (8 seats each)
- **South Terrace**: Suites 1-20 (8 seats each)
- **Lower Fire Suites**: Suites 1-90 (8 seats each)
- **Total**: 130 suites, 1,040 total seats

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Validation**: Zod
- **Email**: Nodemailer (SMTP)
- **Testing**: Playwright
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- Docker & Docker Compose (recommended)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone or navigate to the project
cd fire-suite-exchange

# Copy environment variables
cp .env.example .env

# Start services (PostgreSQL + MailHog)
docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

### Option 2: Local Setup (Without Docker)

```bash
# Install dependencies
npm install

# Set up PostgreSQL locally and update DATABASE_URL in .env
# Update SMTP settings for a real email service or use a local SMTP server

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

## 🔑 Default Credentials (After Seeding)

| Role   | Email                      | Password    |
|--------|----------------------------|-------------|
| Admin  | admin@firesuite.exchange   | Admin123!   |
| Seller | seller@example.com         | Seller123!  |
| Guest  | guest@example.com          | Guest123!   |

## 📧 Email Testing

During development, all emails are captured by [MailHog](https://github.com/mailhog/MailHog):

- **Web UI**: http://localhost:8025
- **SMTP Port**: 1025

View all sent emails in the MailHog web interface.

## 🗄️ Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Re-seed database
npm run db:seed
```

## 📁 Project Structure

```
fire-suite-exchange/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script (130 suites + sample data)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── sell/          # Seller portal
│   │   ├── browse/        # Public browse page
│   │   ├── login/         # Auth pages
│   │   └── layout.tsx     # Root layout
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── seating/       # SeatingMap component
│   │   ├── listings/      # Listing components
│   │   └── admin/         # Admin components
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   ├── auth.ts        # NextAuth config
│   │   ├── utils.ts       # Utility functions
│   │   ├── audit.ts       # Audit logging
│   │   ├── constants.ts   # App constants
│   │   ├── validations/   # Zod schemas
│   │   └── notifications/ # Email service
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── middleware.ts      # Auth middleware
│   ├── auth.config.ts     # NextAuth configuration
│   └── auth.ts            # NextAuth setup
├── tests/
│   └── e2e/               # Playwright tests
├── public/
│   └── uploads/           # File uploads (dev only)
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🔐 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fire_suite_exchange?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Email
SMTP_HOST="mailhog"
SMTP_PORT="1025"
SMTP_FROM="Fire Suite Exchange <noreply@firesuite.exchange>"

# Feature Flags
FEATURE_INTERNAL_MESSAGES="false"  # Enable internal messaging
FEATURE_2FA="false"                # Enable two-factor authentication
FEATURE_INVITE_CODE="false"        # Require invite codes for seller applications
```

## 📝 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (via NextAuth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Seller Applications
- `POST /api/applications` - Submit seller application
- `GET /api/applications/me` - Get current user's applications
- `GET /api/admin/applications` - List all applications (admin)
- `PATCH /api/admin/applications/:id` - Approve/deny application (admin)

### Listings
- `GET /api/listings` - Browse listings (public, with filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (seller only)
- `PATCH /api/listings/:id` - Update listing (seller only)
- `POST /api/listings/:id/mark-sold` - Mark as sold (seller only)
- `POST /api/listings/:id/images` - Upload images (seller only)

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/audit-events` - View audit log
- `PATCH /api/admin/listings/:id` - Moderate listings

## 🧪 Testing

```bash
# Run E2E tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test
npx playwright test tests/e2e/seller-flow.spec.ts
```

### Test Coverage

Critical flows covered:
1. User registration → seller application → approval → listing creation → listing visible
2. Browse/filter listings → view details → contact seller
3. Admin: Review applications, moderate listings, view audit logs

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Production

```bash
# Build production image
docker build -t fire-suite-exchange:latest .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-production-db-url" \
  -e NEXTAUTH_SECRET="your-production-secret" \
  fire-suite-exchange:latest
```

### Environment Setup

1. Set up PostgreSQL database (AWS RDS, Supabase, Railway, etc.)
2. Configure SMTP service (SendGrid, Mailgun, AWS SES, etc.)
3. Set `NEXTAUTH_SECRET` to a secure random string
4. Update `NEXTAUTH_URL` to your production domain
5. Configure file uploads (S3, Cloudinary, etc.)
6. Set all feature flags as needed

## 🔒 Security Considerations

- ✅ Password hashing with bcrypt
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React/Next.js)
- ✅ Role-based access control
- ✅ Rate limiting (TODO: Add middleware)
- ✅ Input validation (Zod)
- ✅ Audit logging
- ✅ HTTPS redirects in production
- ⚠️  File upload validation (size, type)
- ⚠️  Session management (JWT with NextAuth)

## 📊 Database Schema

### Core Models

- **User**: Authentication, roles (GUEST, SELLER, ADMIN)
- **Suite**: 130 suites across 3 areas
- **SellerApplication**: Verification workflow
- **Listing**: Ticket listings with pricing, images, metadata
- **ListingImage**: Multiple images per listing
- **Message**: Internal messaging (feature-flagged)
- **AuditEvent**: Compliance and tracking
- **NotificationPref**: User email/SMS preferences
- **PasswordResetToken**: Secure password resets

## 🎨 Design System

- **Colors**: Navy/slate base with blue primary
- **Typography**: System fonts (-apple-system, Segoe UI, etc.)
- **Spacing**: Tailwind default scale
- **Components**: shadcn/ui (Radix UI primitives)
- **Breakpoints**: Mobile-first responsive
- **Accessibility**: WCAG AA compliant

## 📚 User Workflows

### Buyer Flow
1. Browse listings (filter by area, price, date, etc.)
2. View listing details + seating map
3. Contact seller (email, phone, or internal message)
4. Complete transaction off-platform

### Seller Flow
1. Register account
2. Apply for seller verification (provide suite proof)
3. Wait for admin approval
4. Create listings with photos, pricing, notes
5. Manage listings (edit, mark sold, withdraw)
6. Receive inquiries from buyers

### Admin Flow
1. Review seller applications
2. Approve/deny with notes
3. Moderate listings
4. View audit logs
5. Manage users (lock, change roles)

## 🛣️ Roadmap

**Phase 1** (Current):
- ✅ Core platform with seller verification
- ✅ Listing management
- ✅ Admin dashboard
- ✅ Email notifications

**Phase 2** (Future):
- [ ] Internal messaging system
- [ ] Two-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Stripe integration (escrow/deposits)
- [ ] Calendar view
- [ ] Mobile app (iOS integration)

**Phase 3** (Long-term):
- [ ] API for external partners
- [ ] Automated listing expiration
- [ ] SMS notifications
- [ ] Review/rating system
- [ ] Dispute resolution

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db

# Restart services
docker-compose restart
```

### Prisma Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database
npm run db:reset
```

### Email Not Sending
- Check MailHog is running: http://localhost:8025
- Verify SMTP settings in `.env`
- Check application logs for errors

## 📞 Support

For issues or questions:
- **Documentation**: See `/docs` folder (if added)
- **Issues**: GitHub Issues (if applicable)
- **Email**: admin@firesuite.exchange

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Fire Suite Exchange** - Connecting Ford Amphitheater suite owners with fans 🔥🎵
