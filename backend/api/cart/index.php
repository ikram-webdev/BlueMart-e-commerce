<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();

if ($action === 'list') {
    requireCustomerSession();
    $stmt = $pdo->prepare('SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.discount_price, p.thumbnail
        FROM carts c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = ?');
    $stmt->execute([(int) $_SESSION['user_id']]);
    jsonResponse(['items' => $stmt->fetchAll()]);
}

if ($action === 'add') {
    requireCustomerSession();
    requireFields($data, ['product_id']);
    $quantity = max(1, (int) ($data['quantity'] ?? 1));
    $stmt = $pdo->prepare('INSERT INTO carts (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)');
    $stmt->execute([(int) $_SESSION['user_id'], (int) $data['product_id'], $quantity]);
    jsonResponse(['message' => 'Item added to cart']);
}

if ($action === 'update') {
    requireCustomerSession();
    requireFields($data, ['product_id', 'quantity']);
    $quantity = max(1, (int) $data['quantity']);
    $stmt = $pdo->prepare('UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?');
    $stmt->execute([$quantity, (int) $_SESSION['user_id'], (int) $data['product_id']]);
    jsonResponse(['message' => 'Cart item updated']);
}

if ($action === 'remove') {
    requireCustomerSession();
    requireFields($data, ['product_id']);
    $stmt = $pdo->prepare('DELETE FROM carts WHERE user_id = ? AND product_id = ?');
    $stmt->execute([(int) $_SESSION['user_id'], (int) $data['product_id']]);
    jsonResponse(['message' => 'Cart item removed']);
}

if ($action === 'wishlist-list') {
    requireCustomerSession();
    $stmt = $pdo->prepare('SELECT w.id, p.id AS product_id, p.name, p.price, p.discount_price, p.thumbnail
        FROM wishlists w
        JOIN products p ON p.id = w.product_id
        WHERE w.user_id = ?');
    $stmt->execute([(int) $_SESSION['user_id']]);
    jsonResponse(['items' => $stmt->fetchAll()]);
}

if ($action === 'wishlist-add') {
    requireCustomerSession();
    requireFields($data, ['product_id']);
    $stmt = $pdo->prepare('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)');
    $stmt->execute([(int) $_SESSION['user_id'], (int) $data['product_id']]);
    jsonResponse(['message' => 'Added to wishlist']);
}

if ($action === 'wishlist-remove') {
    requireCustomerSession();
    requireFields($data, ['product_id']);
    $stmt = $pdo->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?');
    $stmt->execute([(int) $_SESSION['user_id'], (int) $data['product_id']]);
    jsonResponse(['message' => 'Removed from wishlist']);
}

jsonResponse(['error' => 'Unknown action'], 404);
