# Ruhena Healthcare Limited

**Pharmacy Management System v1.0** — Complete Sales, Inventory, Debts & B2B Wholesale Management

🏥 **Live System**: https://ruhena-healthcare-limited.vercel.app  
🗄️ **Database**: Supabase PostgreSQL  
🚀 **Deployed On**: Vercel  
📦 **Type**: Static Web App (HTML + CSS + JavaScript)

---

## 📋 System Overview

Ruhena Healthcare Limited is a **comprehensive pharmacy management platform** built for a retail pharmacy in Kenya. It handles:

✅ **Daily Sales (POS)** — Over-the-counter medicine sales  
✅ **Credit Management** — Track debts and payment histories  
✅ **Inventory Tracking** — 452+ medicines with stock alerts  
✅ **Supplier Management** — Purchase orders and stock replenishment  
✅ **B2B/Wholesale** — Bulk orders to other pharmacies/clinics  
✅ **Expense Tracking** — Monthly operational costs  
✅ **Comprehensive Reports** — Sales, inventory, profit analysis  
✅ **Role-Based Access** — Salesperson (full write), Owners (read-only)  
✅ **Dark/Light Theme** — User preference persistence  

---

## 🎯 User Roles

### 🟢 **Ruhena (Salesperson)** — PIN: `Ruhena@2030`
- **Full Write Access**: Create, edit, delete all transactions
- Can add sales, debts, medicines, suppliers, expenses
- Can record debt payments and restock inventory
- View all reports

### 🔵 **Abuu (Owner A)** — PIN: `Abuu@2025`
- **Read-Only**: View dashboard, sales, inventory, reports
- Cannot create/edit/delete any records
- Can export reports and view analytics

### 🟣 **Bushro (Owner B)** — PIN: `Bush@2020`
- **Read-Only**: Same permissions as Owner A
- Monitor business performance remotely

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT LAYER (Browser)          │
│  index.html + shared.css + shared.js    │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────┴──────────────────────────┐
│         VERCEL CDN (Static Files)       │
│    (Geographic distribution & caching)  │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────┴──────────────────────────┐
│  SUPABASE (Backend as a Service)        │
│  ├─ PostgreSQL Database (8 tables)      │
│  ├─ Row-Level Security (RLS) Policies   │
│  ├─ Real-time Subscriptions (future)    │
│  └─ Authentication & REST API           │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ruhena/
├── index.html              # Login screen
├── dashboard.html          # KPI dashboard (charts & alerts)
├── sales.html              # POS & daily sales history
├── debts.html              # Credit customer management
├── inventory.html          # Medicine stock & restock
├── orders.html             # Suppliers & purchase orders
├── b2b.html                # Wholesale customers & invoices
├── expenses.html           # Operational expenses
├── reports.html            # Sales, inventory, profit reports
├── users.html              # Settings & theme preferences
│
├── shared.css              # Global styles & theme variables
├── shared.js               # Supabase client & shared functions
│
├── package.json            # Project metadata (for Vercel)
├── vercel.json             # Vercel deployment config
├── 404.html                # 404 error page (auto-redirect)
├── .env.example            # Environment template
│
├── assets/                 # Branding assets
│   ├── favicon.ico         # Browser tab icon
│   └── README.md
│
├── ruhena_setup.sql        # Database schema setup
├── ruhena_drugs_seed.sql   # 452 medicines pre-populated
│
└── .git/                   # Git version control
```

---

## 🗄️ Database Schema

**8 Tables** in Supabase PostgreSQL:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `sales` | Retail transactions | id, date, medicine, qty, price, payment_method |
| `debts` | Credit customers | id, name, phone, residence, amount, paid, status |
| `inventory` | Medicine stock | id, name, category, price, stock, alert_at |
| `orders` | Supplier purchases | id, date, supplier_id, medicines (JSONB), total, profit |
| `suppliers` | Supplier directory | id, name, phone, email |
| `expenses` | Operational costs | id, date, category, amount, payment_method |
| `b2b_customers` | Wholesale clients | id, business_name, phone, address, contact_person |
| `b2b_orders` | Wholesale invoices | id, customer_id, invoice_no, items (JSONB), total, paid |

**Total Pre-seeded Data**: 452 medicines across 14 categories

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/mohamudmaalim47-collab/ruhena-healthcare-limited.git
cd ruhena

# Open in browser (no build step needed)
open index.html
# or use a local server:
python -m http.server 3000
```

Visit `http://localhost:3000` and login with any PIN.

### Deploy to Vercel

```bash
# Already connected? Just push to GitHub
git push origin main

# First time setup:
vercel login
vercel
# Follow prompts to connect your GitHub repo
```

Vercel will automatically:
- Detect `package.json` + `vercel.json`
- Deploy static files globally
- Provide HTTPS + automatic redirects
- Create preview URLs for PRs

---

## 🔑 Key Features

### 1️⃣ Login & Session Management
- Role-based PIN authentication
- Session persistence (survives page refresh)
- Auto-logout on tab close
- Theme preference saved in localStorage

### 2️⃣ Daily Sales (POS)
- Quick medicine search + auto-fill price
- Real-time stock availability check
- Payment methods: Cash, M-Pesa, Debt, Account
- Automatic inventory deduction
- Receipt printing & CSV export

### 3️⃣ Credit Management
- Multi-medicine debts
- Payment tracking (partial/full)
- Outstanding balance rollover to B2B customers
- Customer contact details

### 4️⃣ Inventory Management
- 452 pre-seeded medicines
- Low stock warnings (configurable alert levels)
- Restock history tracking
- Supplier links
- Category filtering

### 5️⃣ Purchase Orders
- Multi-line orders from suppliers
- Auto-calculate profit margins
- Stock auto-update on save
- Sell price override option

### 6️⃣ B2B Wholesale
- Bulk pricing (different from retail)
- Outstanding balance auto-injection
- Invoice generation
- Payment tracking per customer

### 7️⃣ Expense Tracking
- 8 categories (Rent, Salaries, Utilities, etc.)
- Payment method tracking
- Monthly summaries
- Category breakdown charts

### 8️⃣ Reports
- **Sales Report**: Revenue, cost, profit, margin %
- **Inventory Report**: Stock levels, alert status
- **Low Stock Report**: Reorder recommendations
- **Expense Report**: Category breakdowns
- **Profit Analysis**: Trend charts over 30 days
- Export to CSV + Print

### 9️⃣ Dashboard
- Real-time KPIs: Today's sales, cost, profit, margin
- Inventory alerts: Out of stock + low stock counts
- Revenue vs Profit chart (30-day trend)
- Sales volume bar chart

---

## 🔐 Security & Best Practices

### Current Security Model (Development)
- ✅ PIN-based authentication (simple, no password needed)
- ✅ Session storage (cleared on browser close)
- ✅ Supabase Row-Level Security (RLS) policies configured
- ✅ HTTPS-only on Vercel

### Production Ready
To productionize:

1. **Enable RLS Policies** in Supabase:
   ```sql
   -- Only salesperson can INSERT/UPDATE/DELETE
   -- Owners can only SELECT (read-only)
   ```

2. **Add Password Hashing** in future versions:
   - Use bcrypt for PIN storage
   - Move to Supabase Auth

3. **Enable API Rate Limiting** in Supabase

4. **Add Audit Logging** for compliance

---

## 🛠️ Supabase Configuration

### Setup Steps

1. **Create Supabase Project**:
   - Go to https://supabase.com → New Project
   - Choose region (preferably closest to Kenya)
   - Save Anon Key & URL

2. **Create Database Tables**:
   - Run `ruhena_setup.sql` in Supabase SQL Editor
   - This creates all 8 tables with proper structure

3. **Seed 452 Medicines**:
   - Run `ruhena_drugs_seed.sql`
   - Populates inventory with real pharmacy medicines

4. **Update shared.js**:
   - Find lines 2-3 in `shared.js`
   - Replace `SB_URL` and `SB_KEY` with your credentials
   - Or set as environment variables

### Environment Variables

Create `.env.local` file (never commit):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
```

Or in Vercel dashboard → Settings → Environment Variables

---

## 📱 Pages & Navigation

| Page | URL | Visible To | Write Access |
|------|-----|-----------|--------------|
| Login | `/index.html` | Public | — |
| Dashboard | `/dashboard.html` | All | — |
| Daily Sales | `/sales.html` | All | Ruhena only |
| Debts | `/debts.html` | All | Ruhena only |
| Inventory | `/inventory.html` | All | Ruhena only |
| Orders | `/orders.html` | All | Ruhena only |
| B2B | `/b2b.html` | All | Ruhena only |
| Expenses | `/expenses.html` | All | Ruhena only |
| Reports | `/reports.html` | All | Read-only |
| Users | `/users.html` | All | Theme only |

---

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] Test login with all 3 PIN codes
- [ ] Verify Supabase connection in browser console
- [ ] Test one transaction end-to-end (add sale → verify inventory update)
- [ ] Check 404 page (navigate to non-existent URL)
- [ ] Verify favicon loads
- [ ] Test dark/light theme toggle
- [ ] Test on mobile (iOS Safari, Chrome)
- [ ] Export CSV from reports
- [ ] Print receipt from sales page
- [ ] Verify RLS policies are correct (if production)

---

## 🐛 Debugging

### Check Console for Errors
Press `F12` → Console tab:
- Look for red errors (missing files, API failures)
- API errors show Supabase response
- Session errors show login issues

### Common Issues

| Issue | Solution |
|-------|----------|
| "Supabase connection failed" | Check URL & Key in shared.js |
| 404 on shared.css | Verify file exists in repo root |
| Login doesn't work | Check PIN exactly: `Ruhena@2030` |
| Sales not saving | Check inventory table exists in Supabase |
| Dark theme not persisting | Check localStorage permissions |

### Live Debugging

```bash
# View Vercel deployment logs
vercel logs ruhena-healthcare-limited.vercel.app

# Check if files uploaded
vercel ls

# Re-deploy with debug info
vercel --debug
```

---

## 📞 Support & Contact

| Contact | Details |
|---------|---------|
| **Owner** | mohamudmaalim47 (GitHub) |
| **Organization** | mohamudmaalim47-collab |
| **Repository** | ruhena-healthcare-limited |
| **Live URL** | https://ruhena-healthcare-limited.vercel.app |

---

## 📋 License

MIT License © 2026 Ruhena Healthcare Limited

---

## 🚀 Future Enhancements

**Planned Features** (v2.0+):
- [ ] Mobile app (React Native)
- [ ] SMS notifications (for debt reminders)
- [ ] Barcode scanning
- [ ] Advanced analytics (inventory forecasting)
- [ ] Multi-location support
- [ ] Staff management & clocking
- [ ] Integration with M-Pesa API
- [ ] Offline mode (sync when online)
- [ ] Prescription management
- [ ] Patient loyalty program

---

**Last Updated**: June 2026  
**Status**: ✅ Production Ready

