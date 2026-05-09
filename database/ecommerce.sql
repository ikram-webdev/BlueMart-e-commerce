CREATE DATABASE IF NOT EXISTS ecommerce_store;
USE ecommerce_store;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'vendor', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_name VARCHAR(150) NOT NULL,
  description TEXT,
  logo VARCHAR(255) DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 4.0,
  thumbnail VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  vendor_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  discount_percent INT NOT NULL DEFAULT 10,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  subtitle VARCHAR(255) DEFAULT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO admins (name, email, password)
VALUES ('Main Admin', 'admin@ecom.local', '$2y$10$3JaNVukNWHf66A1Vpzwu4uFTKM95Yr2s5jW5QxQx9EwD7fDU6jYvO');

INSERT IGNORE INTO categories (name, slug)
VALUES
('Electronics', 'electronics'),
('Fashion', 'fashion'),
('Home & Living', 'home-living'),
('Beauty', 'beauty'),
('Sports', 'sports');

INSERT IGNORE INTO coupons (code, title, discount_percent, is_active)
VALUES
('WELCOME10', 'New user discount', 10, 1),
('DEAL15', 'Flash deal savings', 15, 1);

INSERT IGNORE INTO banners (id, title, subtitle, image_path, is_active)
VALUES
(1, 'Mega Sale Week', 'Up to 40% off on top categories', 'https://via.placeholder.com/1200x400?text=Mega+Sale', 1),
(2, 'Top Vendors', 'Discover trusted stores today', 'https://via.placeholder.com/1200x400?text=Top+Vendors', 1);

-- Demo credentials (password for all seeded users: admin123)
INSERT IGNORE INTO users (name, email, phone, password, role)
VALUES
('Demo Customer', 'customer@ecom.local', '03000000001', '$2y$10$3JaNVukNWHf66A1Vpzwu4uFTKM95Yr2s5jW5QxQx9EwD7fDU6jYvO', 'customer'),
('Demo Vendor Owner', 'vendor@ecom.local', '03000000002', '$2y$10$3JaNVukNWHf66A1Vpzwu4uFTKM95Yr2s5jW5QxQx9EwD7fDU6jYvO', 'vendor');

INSERT IGNORE INTO vendors (user_id, store_name, description, status)
SELECT u.id, 'BlueMart Official Store', 'Top rated vendor in electronics and lifestyle', 'approved'
FROM users u
WHERE u.email = 'vendor@ecom.local';

INSERT IGNORE INTO products (vendor_id, category_id, name, slug, description, price, discount_price, stock, thumbnail)
SELECT v.id, c.id, 'Wireless Earbuds Pro', 'wireless-earbuds-pro-seed', 'High-quality sound with noise cancellation', 49.99, 39.99, 120, 'https://via.placeholder.com/280x220?text=Earbuds'
FROM vendors v
JOIN categories c ON c.slug = 'electronics'
WHERE v.store_name = 'BlueMart Official Store';

INSERT IGNORE INTO products (vendor_id, category_id, name, slug, description, price, discount_price, stock, thumbnail)
SELECT v.id, c.id, 'Smart Fitness Watch', 'smart-fitness-watch-seed', 'Track health metrics and daily activity', 89.99, 69.99, 80, 'https://via.placeholder.com/280x220?text=Watch'
FROM vendors v
JOIN categories c ON c.slug = 'sports'
WHERE v.store_name = 'BlueMart Official Store';

INSERT IGNORE INTO products (vendor_id, category_id, name, slug, description, price, discount_price, stock, thumbnail)
SELECT v.id, c.id, 'Hydrating Face Serum', 'hydrating-face-serum-seed', 'Lightweight skincare serum for daily use', 24.99, 19.99, 150, 'https://via.placeholder.com/280x220?text=Serum'
FROM vendors v
JOIN categories c ON c.slug = 'beauty'
WHERE v.store_name = 'BlueMart Official Store';
