# Stockwise REST API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication & Headers

Protected routes require a valid JSON Web Token (JWT) sent in the HTTP `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

Responses follow a uniform JSON structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 1. Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Rate Limit**: 10 attempts per 15 minutes
- **Body**:
  ```json
  {
    "email": "arya.singh@stockwise.io",
    "password": "Stockwise2026"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "name": "Arya Singh",
        "email": "arya.singh@stockwise.io",
        "role": "admin"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### Current User Profile
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Arya Singh",
      "email": "arya.singh@stockwise.io",
      "role": "admin",
      "status": "active"
    }
  }
  ```

### Register (Admin Only or Provisioned)
- **POST** `/auth/register`
- **Headers**: `Authorization: Bearer <token>` (Admin required)
- **Body**:
  ```json
  {
    "name": "Warehouse Staff",
    "email": "staff@stockwise.io",
    "password": "Password123",
    "role": "staff"
  }
  ```

---

## 2. Product & Inventory Endpoints

### List Products
- **GET** `/products?page=1&limit=20&search=scanner&category=Logistics&status=active&sortBy=created_at&sortOrder=DESC`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "sku": "LOG-SCN-001",
        "name": "Industrial Barcode Scanner X-200",
        "category": "Logistics & Material Handling",
        "price": 289.99,
        "cost": 175.00,
        "quantity": 42,
        "reorder_level": 15,
        "unit": "pcs",
        "status": "active"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
  ```

### Get Product Details
- **GET** `/products/:id`
- **Headers**: `Authorization: Bearer <token>`

### Create Product
- **POST** `/products`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "sku": "PKG-BX-099",
    "name": "Heavy Duty Shipping Boxes (100pk)",
    "description": "Double-wall corrugated shipping boxes",
    "categoryId": 2,
    "costPrice": 42.00,
    "sellingPrice": 69.99,
    "quantity": 120,
    "reorderLevel": 30,
    "unit": "pack",
    "status": "active"
  }
  ```

### Update Product
- **PUT** `/products/:id`
- **Headers**: `Authorization: Bearer <token>`

### Adjust Stock (With Audit Trail & Movement Record)
- **POST** `/products/:id/adjust-stock`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "quantityDelta": 10,
    "reason": "Physical cycle count reconciliation",
    "movementType": "adjustment"
  }
  ```

### Stock Movements History
- **GET** `/products/:id/movements`
- **Headers**: `Authorization: Bearer <token>`

### Low-Stock Alerts
- **GET** `/products/low-stock`
- Returns products where `quantity <= reorder_level` and `quantity > 0`.

### Out-of-Stock
- **GET** `/products/out-of-stock`
- Returns products where `quantity = 0`.

---

## 3. Categories

- **GET** `/categories` — List all categories with product counts
- **POST** `/categories` — Create category
- **PUT** `/categories/:id` — Update category
- **DELETE** `/categories/:id` — Delete category (prevented if products are assigned)

---

## 4. Suppliers & Customers

### Suppliers
- **GET** `/suppliers` — List suppliers with pagination & search
- **GET** `/suppliers/:id` — Details
- **POST** `/suppliers` — Create supplier
- **PUT** `/suppliers/:id` — Update supplier
- **DELETE** `/suppliers/:id` — Archive/delete supplier (prevented if POs exist)

### Customers
- **GET** `/customers` — List customers with pagination & search
- **GET** `/customers/:id` — Details
- **POST** `/customers` — Create customer
- **PUT** `/customers/:id` — Update customer
- **DELETE** `/customers/:id` — Archive/delete customer (prevented if sales orders exist)

---

## 5. Purchase Orders

- **GET** `/purchase-orders` — List purchase orders with filter by status & supplier
- **GET** `/purchase-orders/:id` — Full details with line items
- **POST** `/purchase-orders` — Create new purchase order with multiple items:
  ```json
  {
    "supplierId": 1,
    "expectedDate": "2026-11-01",
    "notes": "Urgent restocking batch",
    "items": [
      {
        "productId": 1,
        "quantity": 25,
        "unitCost": 175.00
      }
    ]
  }
  ```
- **PATCH** `/purchase-orders/:id/submit` — Transition to `pending`
- **PATCH** `/purchase-orders/:id/approve` — Transition to `approved`
- **PATCH** `/purchase-orders/:id/cancel` — Cancel order
- **PATCH** `/purchase-orders/:id/receive` — Receive inventory atomically (increments product `quantity`, creates `stock_movements` record, marks PO as `received`)

---

## 6. Sales Orders

- **GET** `/sales-orders` — List sales orders
- **GET** `/sales-orders/:id` — Full details with line items
- **POST** `/sales-orders` — Create sales order (validates inventory, locks product rows, checks for overselling, decrements product `quantity`, creates `stock_movements` record):
  ```json
  {
    "customerId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 289.99
      }
    ],
    "notes": "Direct B2B delivery"
  }
  ```
- **PATCH** `/sales-orders/:id/confirm` — Mark as confirmed
- **PATCH** `/sales-orders/:id/cancel` — Cancel sales order and restore product quantities

---

## 7. Dashboard Endpoints

- **GET** `/dashboard/summary` — Key KPIs (totalProducts, totalUnits, totalValuation, lowStockCount, outOfStockCount, totalSuppliers, totalCustomers, totalSalesRevenue)
- **GET** `/dashboard/sales-trend?range=year` — Monthly/weekly sales & purchase trend aggregation
- **GET** `/dashboard/recent-orders` — Latest 5 purchase and sales orders
- **GET** `/dashboard/top-products` — Highest selling items by units and revenue
- **GET** `/dashboard/stock-alerts` — Critical items requiring replenishment
- **GET** `/dashboard/categories-breakdown` — Valuation and percentage share by product category

---

## 8. Reports & Data Exports

- **GET** `/reports/inventory` — Detailed inventory valuation & turnover audit
- **GET** `/reports/low-stock` — Reorder report
- **GET** `/reports/stock-movements?startDate=&endDate=` — Ledger of all inbound/outbound stock
- **GET** `/reports/sales?startDate=&endDate=` — Sales revenue and payment report
- **GET** `/reports/purchases?startDate=&endDate=` — Purchase expenditure report
- **GET** `/reports/export/inventory-csv` — Direct CSV file download of current inventory ledger

---

## 9. Notifications & Settings

- **GET** `/notifications` — List notifications for authenticated user
- **PATCH** `/notifications/:id/read` — Mark notification read
- **PATCH** `/notifications/read-all` — Mark all as read
- **GET** `/settings` — System parameters (company name, currency, low stock alert threshold)
- **PUT** `/settings` — Update parameters (admin only)
