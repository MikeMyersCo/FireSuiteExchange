#!/bin/bash

# Fire Suite Exchange - Complete Setup Script
# Run this AFTER installing PostgreSQL

set -e  # Exit on any error

echo "🔥 Fire Suite Exchange Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from fire-suite-exchange directory"
    exit 1
fi

# Check if PostgreSQL is accessible
echo "📋 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ Error: PostgreSQL not found in PATH"
    echo ""
    echo "If you installed Postgres.app, add it to PATH:"
    echo "  sudo mkdir -p /etc/paths.d"
    echo "  echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp"
    echo ""
    echo "Then restart your terminal and run this script again."
    exit 1
fi

echo "✅ PostgreSQL found"
echo ""

# Create database if it doesn't exist
echo "🗄️  Creating database..."
if psql -lqt | cut -d \| -f 1 | grep -qw fire_suite_exchange; then
    echo "✅ Database 'fire_suite_exchange' already exists"
else
    createdb fire_suite_exchange
    echo "✅ Database created"
fi
echo ""

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npm run db:generate
echo ""

# Push schema
echo "📊 Creating database tables..."
npm run db:push
echo ""

# Seed database
echo "🌱 Seeding database (130 suites + sample data)..."
npm run db:seed
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "🔑 Login credentials:"
echo "   Admin:  admin@firesuite.exchange / Admin123!"
echo "   Seller: seller@example.com / Seller123!"
echo "   Guest:  guest@example.com / Guest123!"
echo ""
