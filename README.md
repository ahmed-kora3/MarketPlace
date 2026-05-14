# Handmade Marketplace — Laravel + React

A production-ready marketplace for handmade products built with **Laravel 11** (API Backend) and **React** (SPA Frontend).

---

## 🏗 Architecture Overview

```
Backend (Laravel)
├── API Versioning:          /api/v1/
├── Auth:                    Laravel Sanctum (token-based)
├── Roles:                   admin | seller | buyer
├── Pattern:                 MVC + Repository + Service Layer
├── Authorization:           Policies + Middleware (RoleMiddleware)
└── Validation:              Form Requests

Frontend (React SPA)
├── Router:                  React Router v6
├── HTTP Client:             Axios (with interceptors)
├── State:                   AuthContext (React Context API)
└── Pages:                   Login, Register, Products, Cart, Orders, Dashboards
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- PHP >= 8.2
- Composer
- MySQL (via XAMPP or similar)
- Node.js >= 18

### 1. Clone & Configure Backend

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env
DB_DATABASE=handmade_marketplace
DB_USERNAME=root
DB_PASSWORD=

# Run migrations and seed test data
php artisan migrate:fresh --seed

# Start development server
php artisan serve
```

### 2. Setup React Frontend

```bash
cd frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and connects to the Laravel API at `http://localhost:8000`.

---

## 👤 Test Accounts (After Seeding)

| Role   | Email                     | Password  |
|--------|---------------------------|-----------|
| Admin  | admin@marketplace.com     | password  |
| Seller | seller@marketplace.com    | password  |
| Seller | sara@marketplace.com      | password  |
| Buyer  | buyer@marketplace.com     | password  |

---

## 📡 API Documentation

### Base URL: `http://localhost:8000/api/v1`

### Authentication Endpoints

| Method | Endpoint             | Auth | Description         |
|--------|----------------------|------|---------------------|
| POST   | `/auth/register`     | ❌   | Register new user   |
| POST   | `/auth/login`        | ❌   | Login & get token   |
| POST   | `/auth/logout`       | ✅   | Revoke token        |
| GET    | `/auth/me`           | ✅   | Get current user    |

#### Register Request Body
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "buyer"
}
```

#### Login Request Body
```json
{
  "email": "buyer@marketplace.com",
  "password": "password"
}
```

#### Response Format (All Endpoints)
```json
{
  "status": "Success",
  "message": "Login successful.",
  "data": {
    "user": { "id": 1, "name": "...", "email": "...", "role": "buyer" },
    "token": "1|abc123..."
  }
}
```

### Product Endpoints

| Method | Endpoint                    | Auth        | Role   | Description              |
|--------|-----------------------------|-------------|--------|--------------------------|
| GET    | `/products`                 | ❌           | Any    | List all products        |
| GET    | `/products/{id}`            | ❌           | Any    | Product details          |
| POST   | `/seller/products`          | ✅ Bearer    | seller | Create product           |
| PUT    | `/seller/products/{id}`     | ✅ Bearer    | seller | Update product (owner)   |
| DELETE | `/seller/products/{id}`     | ✅ Bearer    | seller | Soft-delete product      |
| GET    | `/seller/products`          | ✅ Bearer    | seller | My products list         |

#### Query Parameters for GET /products
```
?search=ring         → Search by name
?category_id=1       → Filter by category
?min_price=10        → Minimum price
?max_price=100       → Maximum price
?per_page=15         → Items per page
```

### Cart Endpoints (Buyer Only)

| Method | Endpoint                     | Auth     | Description         |
|--------|------------------------------|----------|---------------------|
| GET    | `/buyer/cart`                | ✅ Bearer | Get current cart    |
| POST   | `/buyer/cart`                | ✅ Bearer | Add item to cart    |
| PUT    | `/buyer/cart/{cartItemId}`   | ✅ Bearer | Update item qty     |
| DELETE | `/buyer/cart/{cartItemId}`   | ✅ Bearer | Remove item         |

#### Add to Cart Request Body
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Order Endpoints (Buyer Only)

| Method | Endpoint                     | Auth     | Description         |
|--------|------------------------------|----------|---------------------|
| POST   | `/buyer/orders/checkout`     | ✅ Bearer | Create order from cart |
| GET    | `/buyer/orders`              | ✅ Bearer | My orders           |
| GET    | `/buyer/orders/{id}`         | ✅ Bearer | Single order        |

### Review Endpoints

| Method | Endpoint                           | Auth     | Role   | Description          |
|--------|------------------------------------|----------|--------|----------------------|
| GET    | `/products/{id}/reviews`           | ❌        | Any    | Get product reviews  |
| POST   | `/buyer/products/{id}/reviews`     | ✅ Bearer | buyer  | Add review           |

#### Add Review Request Body
```json
{
  "rating": 5,
  "comment": "Amazing quality, highly recommend!"
}
```

### Admin Endpoints

| Method | Endpoint                          | Auth     | Role  | Description          |
|--------|-----------------------------------|----------|-------|----------------------|
| GET    | `/admin/dashboard`                | ✅ Bearer | admin | Stats & analytics    |
| GET    | `/admin/orders`                   | ✅ Bearer | admin | All orders           |
| PATCH  | `/admin/orders/{id}/status`       | ✅ Bearer | admin | Update order status  |
| POST   | `/admin/categories`               | ✅ Bearer | admin | Create category      |

#### Update Order Status Request Body
```json
{
  "status": "shipped"
}
```
*Valid statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`*

---

## 🔐 Security Features

- **Token Auth:** Laravel Sanctum with scoped tokens per role
- **RBAC:** RoleMiddleware + Laravel Policies on every route
- **Mass Assignment Protection:** `$fillable` defined on all models
- **SQL Injection Prevention:** Eloquent ORM (never raw SQL)
- **Input Validation:** Form Requests on every write operation
- **Password Hashing:** Bcrypt via Laravel's `hashed` cast

---

## 🗂 Project Structure

```
app/
├── Http/
│   ├── Controllers/Api/V1/    ← Thin controllers (no business logic)
│   │   ├── Auth/
│   │   ├── Admin/
│   │   ├── ProductController.php
│   │   ├── CartController.php
│   │   ├── OrderController.php
│   │   └── ReviewController.php
│   ├── Middleware/
│   │   └── RoleMiddleware.php  ← Custom RBAC middleware
│   ├── Requests/               ← Form Requests (validation)
│   └── Resources/              ← API Resources (response shaping)
├── Models/                     ← Eloquent Models
├── Policies/                   ← Authorization Policies
├── Repositories/               ← Data access layer
├── Services/                   ← Business logic layer
└── Traits/
    └── ApiResponseTrait.php    ← Unified API response format
```

---

## ⚙️ Environment Variables (.env.example)

```env
APP_NAME="Handmade Marketplace"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=handmade_marketplace
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```
