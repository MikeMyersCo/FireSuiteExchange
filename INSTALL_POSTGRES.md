# Installing PostgreSQL - Choose Your Method

## Option 1: Postgres.app (Recommended - Easiest!)

**Takes 2 minutes, no terminal commands needed:**

1. **Download**: Visit https://postgresapp.com/downloads.html
2. **Install**: Open the downloaded file and drag to Applications
3. **Start**: Open Postgres.app from Applications
4. **Initialize**: Click "Initialize" (creates default postgres database)
5. **Done!** PostgreSQL is now running

### After Installing Postgres.app:

```bash
# Add to your PATH (run once)
sudo mkdir -p /etc/paths.d
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp

# Create the database
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb fire_suite_exchange

# Or if PATH is set, just:
createdb fire_suite_exchange
```

Then continue with the setup commands in terminal.

---

## Option 2: Homebrew (Command Line)

**If you have Homebrew already:**

```bash
# Install PostgreSQL
brew install postgresql@16

# Start the service
brew services start postgresql@16

# Create database
createdb fire_suite_exchange
```

**Don't have Homebrew? Install it first:**

```bash
# Install Homebrew (you'll need to enter your password)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow the on-screen instructions to add Homebrew to your PATH
# Then install PostgreSQL as shown above
```

---

## Option 3: Docker Desktop (If You Want Full Docker)

1. **Download**: https://www.docker.com/products/docker-desktop/
2. **Install**: Open the downloaded .dmg and drag Docker to Applications
3. **Start**: Open Docker Desktop from Applications
4. **Wait**: Wait for "Docker Desktop is running" in menu bar
5. **Run**:

```bash
cd /Users/mikemyers/dev/fire-suite-exchange
docker compose up -d
```

This starts both PostgreSQL and MailHog (for email testing).

---

## After PostgreSQL is Running

Run these commands to finish setup:

```bash
cd /Users/mikemyers/dev/fire-suite-exchange

# 1. Generate Prisma client
npm run db:generate

# 2. Create database tables
npm run db:push

# 3. Seed database (130 suites + sample users)
npm run db:seed

# 4. Start the app
npm run dev
```

Then visit: **http://localhost:3000**

---

## Verification

To check if PostgreSQL is running:

```bash
# For Postgres.app or Homebrew:
psql --version
psql -l  # List all databases

# For Docker:
docker compose ps
```

---

## Troubleshooting

**"Command not found: psql" (Postgres.app)**
- Add to PATH as shown in Option 1 above
- Or use full path: `/Applications/Postgres.app/Contents/Versions/latest/bin/psql`

**"Connection refused"**
- Make sure PostgreSQL is running
- For Postgres.app: Check the elephant icon in menu bar
- For Homebrew: `brew services list`
- For Docker: `docker compose ps`

**"Database does not exist"**
- Run: `createdb fire_suite_exchange`
- Or the .env file has wrong DATABASE_URL

---

## Which Option Should I Choose?

- **Just want it to work?** → Postgres.app (Option 1)
- **Comfortable with terminal?** → Homebrew (Option 2)
- **Want email testing too?** → Docker (Option 3)

All options work perfectly fine! Choose what you're most comfortable with.
