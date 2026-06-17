# Ruhena Healthcare Limited v3.0

Pharmacy management system built for Kenyan healthcare providers.

## Features

- **Point of Sale** — Fast search, cart, multiple payment methods (Cash, M-Pesa, Insurance, Credit)
- **Inventory Management** — Stock tracking, batch expiry alerts, low stock warnings
- **Sales & Reports** — Revenue trends, profit margins, top-selling medicines
- **Debt Tracking** — Outstanding balances, payment history
- **Insurance Claims** — SHA/NHIF/Private claim submission and tracking
- **Prescriptions** — Digital prescription management with dispense workflow
- **Supplier Management** — Contact details, KRA PIN, lead times
- **Branch Management** — Multi-location support
- **Shift Management** — Staff shift tracking with cash reconciliation
- **Staff Management** — Role-based access (admin, pharmacist, sales, inventory, accountant)
- **B2B Management** — Business customer accounts and bulk orders
- **Export** — CSV reports ready for KRA eTIMS compliance

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Backend:** Firebase Firestore + Firebase Auth
- **Charts:** Chart.js
- **Hosting:** Vercel (auto-deployed from GitHub)
- **Icons:** Emoji-native (no icon library dependency)

## Setup

1. Open `setup.html` to create the admin/owner account
2. Login with the created credentials
3. Add staff members from the Users page
4. Configure branches from the Branches page
5. Start recording sales and managing inventory

## File Structure

```
Ruhena/
├── index.html          Login page
├── dashboard.html      Main analytics dashboard
├── pos.html            Point of Sale
├── sales.html          Sales records
├── inventory.html      Stock management
├── orders.html         Purchase orders
├── prescriptions.html  Prescription management
├── insurance.html      Insurance claims
├── suppliers.html      Supplier management
├── branches.html       Branch management
├── shifts.html         Shift management
├── debts.html          Outstanding debts
├── expenses.html       Expense tracking
├── reports.html        Full reports
├── analytics.html      AI insights & forecasting
├── users.html          Staff management
├── b2b.html            Business-to-business
├── settings.html       System settings
├── setup.html          First-time setup wizard
├── shared.css          Global styles
├── shared.js           Firebase init + utilities
├── firestore.rules     Security rules
├── firestore.indexes.json  Composite indexes
├── firebase.json       Firebase config
├── vercel.json         Vercel deployment config
└── storage.rules       Firebase Storage rules
```

## Color Palette

- Primary: Sky Blue (`#0284C7`)
- Success: Kenyan Green (`#059669`)
- Warning: Amber (`#D97706`)
- Danger: Rose (`#DC2626`)
- AI/Insights: Violet (`#7C3AED`)
- M-Pesa: Warm Orange (`#F97316`)
