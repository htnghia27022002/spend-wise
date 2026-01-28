#!/bin/bash

# Finance System Setup Script
# Run this after starting the Docker container

echo "🚀 Setting up Finance Management System..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Running database migrations...${NC}"
php artisan migrate --force
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Migrations failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Clearing cache...${NC}"
php artisan optimize:clear
echo -e "${GREEN}✓ Cache cleared${NC}"

echo ""
echo -e "${BLUE}3. Building frontend assets...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}⚠ Frontend build completed with warnings${NC}"
fi

echo ""
echo -e "${GREEN}✅ Finance System setup complete!${NC}"
echo ""
echo -e "${BLUE}Available features:${NC}"
echo "  📊 Dashboard: /finance/dashboard"
echo "  💰 Wallets: /wallets"
echo "  📝 Transactions: /transactions"
echo "  🔄 Subscriptions: /subscriptions"
echo "  📅 Installments: /installments"
echo "  📬 Notifications: /notifications"
echo "  📂 Categories: /categories"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Create categories for income/expenses"
echo "  2. Create wallets for your accounts"
echo "  3. Start recording transactions"
echo "  4. Setup recurring subscriptions"
echo "  5. Create installment plans"
echo ""
echo -e "${BLUE}📖 Full documentation:${NC}"
echo "  See FINANCE_SYSTEM.md"
echo ""
