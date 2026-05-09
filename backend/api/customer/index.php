<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();
requireCustomerSession();
$userId = (int) $_SESSION['user_id'];

function ensureCustomerAddressesTable(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS customer_addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            label VARCHAR(80) NOT NULL,
            address_line VARCHAR(512) NOT NULL,
            city VARCHAR(120) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_customer_addresses_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

if ($action === 'profile') {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role FROM users WHERE id = ? AND role = 'customer'");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    if (!$row) {
        jsonResponse(['error' => 'User not found'], 404);
    }
    jsonResponse(['user' => $row]);
}

if ($action === 'profile-update') {
    requireFields($data, ['name']);
    $name = trim((string) $data['name']);
    $phone = trim((string) ($data['phone'] ?? ''));

    $stmt = $pdo->prepare('UPDATE users SET name = ?, phone = ? WHERE id = ? AND role = ?');
    $stmt->execute([$name, $phone, $userId, 'customer']);

    $stmt = $pdo->prepare("SELECT id, name, email, phone, role FROM users WHERE id = ? AND role = 'customer'");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    jsonResponse(['message' => 'Profile updated', 'user' => $user]);
}

if ($action === 'change-password') {
    requireFields($data, ['old_password', 'new_password']);
    $newPass = (string) $data['new_password'];
    if (strlen($newPass) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters'], 422);
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ? AND role = 'customer'");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    if (!$row || !password_verify((string) $data['old_password'], (string) $row['password'])) {
        jsonResponse(['error' => 'Current password is incorrect'], 401);
    }

    $upd = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $upd->execute([password_hash($newPass, PASSWORD_DEFAULT), $userId]);
    jsonResponse(['message' => 'Password changed']);
}

if ($action === 'addresses') {
    ensureCustomerAddressesTable($pdo);
    $stmt = $pdo->prepare('SELECT id, label, address_line AS address, city, created_at FROM customer_addresses WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$userId]);
    jsonResponse(['addresses' => $stmt->fetchAll()]);
}

if ($action === 'address-save') {
    ensureCustomerAddressesTable($pdo);
    requireFields($data, ['label', 'address', 'city']);

    $label = trim((string) $data['label']);
    $line = trim((string) $data['address']);
    $city = trim((string) $data['city']);
    $addressId = (int) ($data['id'] ?? 0);

    if ($addressId > 0) {
        $check = $pdo->prepare('SELECT id FROM customer_addresses WHERE id = ? AND user_id = ?');
        $check->execute([$addressId, $userId]);
        if (!$check->fetch()) {
            jsonResponse(['error' => 'Address not found'], 404);
        }
        $upd = $pdo->prepare('UPDATE customer_addresses SET label = ?, address_line = ?, city = ? WHERE id = ? AND user_id = ?');
        $upd->execute([$label, $line, $city, $addressId, $userId]);
        jsonResponse(['message' => 'Address updated', 'id' => $addressId]);
    }

    $ins = $pdo->prepare('INSERT INTO customer_addresses (user_id, label, address_line, city) VALUES (?, ?, ?, ?)');
    $ins->execute([$userId, $label, $line, $city]);
    jsonResponse(['message' => 'Address saved', 'id' => (int) $pdo->lastInsertId()]);
}

if ($action === 'address-delete') {
    ensureCustomerAddressesTable($pdo);
    requireFields($data, ['id']);
    $stmt = $pdo->prepare('DELETE FROM customer_addresses WHERE id = ? AND user_id = ?');
    $stmt->execute([(int) $data['id'], $userId]);
    jsonResponse(['message' => 'Address deleted']);
}

jsonResponse(['error' => 'Unknown action'], 404);
