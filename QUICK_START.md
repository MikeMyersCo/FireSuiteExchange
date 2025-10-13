# 🚀 Quick Start - Fire Suite Exchange

## ⚠️ Prerequisites Needed

The app needs PostgreSQL to run. Here are the easiest options:

### Option 1: Postgres.app (Easiest for macOS)

1. Download from: https://postgresapp.com/
2. Open the app and click "Initialize"
3. That's it! PostgreSQL is running.

### Option 2: Homebrew

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb fire_suite_exchange
```

### Option 3: Docker (if you want to install it)

```bash
# Install Docker Desktop: https://www.docker.com/products/docker-desktop/
# Then run:
docker compose up -d
```

## ✅ Once PostgreSQL is Running

```bash
cd /Users/mikemyers/dev/fire-suite-exchange

# 1. Generate Prisma client
npm run db:generate

# 2. Create database schema
npm run db:push

# 3. Seed database (creates 130 suites + sample users)
npm run db:seed

# 4. Start development server
npm run dev
```

Visit: **http://localhost:3000**

## 🔑 Login Credentials

After seeding, you can login with:

- **Admin**: admin@firesuite.exchange / Admin123!
- **Seller**: seller@example.com / Seller123!
- **Guest**: guest@example.com / Guest123!

## 📧 Email Testing (Optional)

If you want to test emails, you'll need MailHog running. For now, emails will fail silently which is fine for development.

To add email testing later, install Docker and run:
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Then view emails at: http://localhost:8025

## 🎯 Current Status

✅ All dependencies installed
✅ Database schema ready
⏸️ Waiting for PostgreSQL to continue

## 💡 What to Do Next

1. Install PostgreSQL using one of the options above
2. Run the commands in the "Once PostgreSQL is Running" section
3. The landing page will load at localhost:3000
4. Follow SETUP_GUIDE.md to add more features
