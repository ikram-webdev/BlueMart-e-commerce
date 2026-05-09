<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();
requireRole('admin');

if ($action === 'users') {
    $stmt = $pdo->query("SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'customer' ORDER BY id DESC");
    jsonResponse(['users' => $stmt->fetchAll()]);
}

if ($action === 'vendors') {
    $stmt = $pdo->query('SELECT v.id, v.store_name, v.status, v.created_at, u.name, u.email
        FROM vendors v JOIN users u ON u.id = v.user_id ORDER BY v.id DESC');
    jsonResponse(['vendors' => $stmt->fetchAll()]);
}

if ($action === 'vendor-status') {
    requireFields($data, ['vendor_id', 'status']);
    if (!in_array($data['status'], ['approved', 'rejected', 'pending'], true)) {
        jsonResponse(['error' => 'Invalid status'], 422);
    }
    $stmt = $pdo->prepare('UPDATE vendors SET status = ? WHERE id = ?');
    $stmt->execute([trim($data['status']), (int) $data['vendor_id']]);
    jsonResponse(['message' => 'Vendor status updated']);
}

if ($action === 'banners') {
    $stmt = $pdo->query('SELECT * FROM banners ORDER BY id DESC');
    jsonResponse(['banners' => $stmt->fetchAll()]);
}

if ($action === 'coupons') {
    $stmt = $pdo->query('SELECT * FROM coupons ORDER BY id DESC');
    jsonResponse(['coupons' => $stmt->fetchAll()]);
}

jsonResponse(['error' => 'Unknown action'], 404);
