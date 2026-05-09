# BlueMart Multi-Vendor eCommerce (React + PHP + MySQL)

Basic but professional multi-vendor eCommerce CMS with:
- Customer storefront and checkout
- Vendor product management and vendor orders
- Admin management views for users, vendors, and orders

## Stack
- Frontend: React + Vite
- Backend: Core PHP REST-style endpoints
- Database: MySQL
- Auth: PHP sessions

## Folder Structure
```text
frontend/
backend/
database/
```

## 1) Database Setup
1. Create MySQL database and import:
   - `database/ecommerce.sql`
2. Default admin login:
   - email: `admin@ecom.local`
   - password: `admin123`

## 2) Backend Setup (PHP)
1. Update DB credentials in `backend/config/database.php` if needed.
2. Import database:
   - `mysql -u root -p < database/ecommerce.sql`
3. Start PHP server from backend folder:
   - `cd backend`
   - `php -S 127.0.0.1:8080`
4. Ensure PHP has:
   - `pdo_mysql`
   - file uploads enabled
5. Backend API base for local dev:
   - `http://127.0.0.1:8080/api`

## 3) Frontend Setup (React)
1. Open terminal:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`
4. Open browser:
   - `http://localhost:5173`
5. Vite proxy forwards `/backend/api/*` to backend `/api/*`.

## 4) One-Command Local Startup (Windows)
- From project root:
  - `start-dev.bat`
- This opens two terminals:
  - PHP backend on `http://127.0.0.1:8080`
  - Vite frontend on `http://localhost:5173`
- Health endpoint:
  - `http://127.0.0.1:8080/health.php`

## API Endpoints Included
- Auth:
  - `auth/index.php?action=register`
  - `auth/index.php?action=login`
  - `auth/index.php?action=logout`
  - `auth/index.php?action=vendor-register`
  - `auth/index.php?action=vendor-login`
  - `auth/index.php?action=admin-login`
- Categories:
  - `categories/index.php?action=list|create|update|delete`
- Products:
  - `products/index.php?action=list|single|create|update|delete|upload-image`
- Cart/Wishlist:
  - `cart/index.php?action=list|add|update|remove|wishlist-list|wishlist-add|wishlist-remove`
- Orders:
  - `orders/index.php?action=place|customer-list|vendor-list|admin-list|admin-update-status`
- Admin:
  - `admin/index.php?action=users|vendors|vendor-status|banners|coupons`

## Notes
- Uses `password_hash` and `password_verify`.
- Uses prepared statements (PDO) to prevent SQL injection.
- Route protection is role-based through session checks.
- Image upload has size/type validation.
- UI is responsive for desktop/tablet/mobile with sidebar collapsing to mobile menu.

---

## MERN Hybrid Foundation (New)

A new backend foundation for the requested MERN hybrid system is added at:

- `mern-backend/`

### Included in this foundation

- Express + MongoDB (Mongoose) setup
- JWT auth (`/api/auth/signup`, `/api/auth/login`, `/api/auth/me`)
- Role-based middleware (admin/vendor/customer)
- Hybrid product flow:
  - Admin and Vendor can create products
  - Vendor products can stay `pending` until admin approval
  - Config toggle `AUTO_APPROVE_VENDOR_PRODUCTS=true|false`
- Product listing returns only `approved` products (no static demo dependency)
- Socket.io wiring with realtime event emit on product create/approve
- Core schemas: `User`, `Category`, `Product`, `Order`, `Notification`

### Run MERN backend

1. Copy environment file:
   - `mern-backend/.env.example` -> `mern-backend/.env`
2. Ensure MongoDB is running locally or update `MONGODB_URI`.
3. Start backend:
   - `cd mern-backend`
   - `npm install`
   - `npm run dev`
