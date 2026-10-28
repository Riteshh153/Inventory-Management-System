# Stockwise — Smart Inventory Management System

A production-grade, full-stack Inventory Management System featuring a high-performance React + Vite dashboard and a robust Node.js/Express REST API backed by MySQL 8+.

---

## 🚀 Features

- **Split-Screen Authentication**: Secure JWT login with bcrypt password hashing and token persistence.
- **Executive Dashboard**: Real-time aggregation of inventory valuation, gross stock counts, turnover trends, and low-stock indicators.
- **Product & Stock Management**: Full catalog CRUD with category filtering, search, SKU enforcement, low/out-of-stock monitoring, and manual stock adjustment with audit logging.
- **Suppliers & Customers**: Partner directories with purchase and sales order relationship tracking and referential integrity.
- **Purchase Order Workflow**: Multi-item purchase orders with automated subtotal calculation, approvals, and atomic inventory receipt transactions.
- **Sales Order Fulfillment**: Multi-item sales orders with server-side validation, row locking, overselling prevention, and automatic stock deduction.
- **Reports & Audits**: Live charts, category valuation breakdown, and one-click CSV export of inventory audits.
- **Enterprise Security**: Helmet headers, CORS protection, rate-limiting on sensitive endpoints, Zod schema validation, and role-based access control (`admin`, `manager`, `staff`).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Recharts, Lucide React, Axios, Vanilla CSS design system.
- **Backend**: Node.js, Express.js, MySQL2 (with connection pooling and transaction helpers), Zod, JWT (`jsonwebtoken`), `bcryptjs`, Helmet, CORS, Morgan.
- **Database**: MySQL 8+ / MariaDB (`stockwise_db`) with relational foreign keys, strict constraints, and indexes.

---

## 📁 Project Structure

```text
Inventory/
├── index.html                   # Single-page application root
├── package.json                 # Frontend dependencies & monorepo scripts
├── vite.config.js               # Vite bundler configuration
├── .env.example                 # Frontend environment template
├── .gitignore                   # Git exclusions (credentials, node_modules)
├── src/
│   ├── api/                     # Axios REST API client modules
│   │   ├── client.js            # Base Axios instance with Bearer interceptors
│   │   ├── auth.js              # Authentication APIs
│   │   ├── products.js          # Product & stock APIs
│   │   ├── categories.js        # Category APIs
│   │   ├── suppliers.js         # Supplier APIs
│   │   ├── customers.js         # Customer APIs
│   │   ├── purchaseOrders.js    # Purchase order APIs
│   │   ├── sales.js             # Sales order APIs
│   │   ├── dashboard.js         # Aggregated KPI & trend APIs
│   │   ├── reports.js           # Audit reports & CSV export
│   │   └── settings.js          # System settings APIs
│   ├── components/              # Layout, Topbar, Navigation Drawer, Modals
│   ├── context/                 # InventoryContext state synced with backend APIs
│   ├── pages/                   # DashboardOverview, Products, Inventory, Orders, Reports...
│   └── styles/                  # Clean green-and-white theme CSS
└── server/                      # Full Backend Application
    ├── package.json             # Backend dependencies & test scripts
    ├── .env.example             # Backend environment template
    ├── API_DOCUMENTATION.md     # Complete REST API reference
    ├── src/
    │   ├── config/              # Database connection pool & env validator
    │   ├── controllers/         # REST API controller handlers
    │   ├── database/
    │   │   ├── schema.sql       # Complete relational MySQL schema (13 tables)
    │   │   └── seed.js          # Safe demo data seeder
    │   ├── middleware/          # JWT auth, RBAC, Zod validation, error handler
    │   ├── routes/              # Modular Express routers
    │   ├── app.js               # Express application configuration
    │   └── server.js            # HTTP server entry point
    └── tests/
        └── api.test.js          # Automated end-to-end integration test suite
```

---

## ⚙️ Quick Start Setup

### 1. Database Setup (MySQL / MariaDB)

Ensure MySQL is running (e.g. via XAMPP, MySQL Server, or Docker):

```bash
# Verify MySQL connection or import schema:
mysql -u root -p < server/src/database/schema.sql
```

The database `stockwise_db` and its 13 tables will be created automatically.

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=stockwise_db
JWT_SECRET=stockwise_jwt_production_secret_key_2026_xyz987
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

**Frontend (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Seed Demo Data

```bash
# In the root project directory:
npm install

# In the server directory:
cd server
npm install
npm run seed
cd ..
```

### 4. Run the Application

Start both the backend server and frontend development server:

```bash
# Terminal 1 - Backend API (Port 5000)
npm run server:dev

# Terminal 2 - Frontend Dashboard (Port 5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Credentials

The development seed creates the following user accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `arya.singh@stockwise.io` | `Stockwise2026` | Full system access, users, settings |
| **Manager** | `marcus.vance@stockwise.io` | `Manager2026` | Inventory, purchase orders, sales orders |
| **Staff** | `sarah.chen@stockwise.io` | `Staff2026` | Inventory view, stock movement logging |

---

## 🧪 Automated Testing

A comprehensive integration test suite verifies the database connection, authentication, protected routes, product CRUD, inventory adjustments, purchase receipt transactions, sales order stock deductions, and dashboard summaries:

```bash
# Run from root:
npm run test:api

# Or directly from server folder:
cd server
npm test
```

Expected result:
```text
=============================================
TEST RESULTS: 15 passed, 0 failed
=============================================
```

---

## 🛡️ Security & Architecture Highlights

1. **Transactional Integrity**: Critical operations (e.g., purchase receipt and sales order placement) run inside `withTransaction(...)` blocks with SQL row locks (`SELECT ... FOR UPDATE`) to prevent concurrent race conditions and overselling.
2. **Password Security**: All credentials are encrypted using `bcrypt` with salt rounds. Passwords and hashes are never exposed in JSON responses.
3. **Audit Trail**: Every stock change is immutably logged to `stock_movements` with reference IDs and user attribution.
4. **Data Validation**: Request payloads are strictly verified against `zod` schemas before hitting controllers.
