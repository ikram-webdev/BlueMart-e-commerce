<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';

if ($action === 'profile') {
    requireRole('vendor');
    $stmt = $pdo->prepare('SELECT v.*, u.name, u.email, u.phone
        FROM vendors v
        JOIN users u ON u.id = v.user_id
        WHERE v.id = ?');
    $stmt->execute([(int) $_SESSION['vendor_id']]);
    jsonResponse(['vendor' => $stmt->fetch()]);
}

if ($action === 'products') {
    requireRole('vendor');
    $stmt = $pdo->prepare('SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.vendor_id = ?
        ORDER BY p.id DESC');
    $stmt->execute([(int) $_SESSION['vendor_id']]);
    jsonResponse(['products' => $stmt->fetchAll()]);
}

jsonResponse(['error' => 'Unknown action'], 404);
