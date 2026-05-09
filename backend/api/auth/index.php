<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

/**
 * Persist CNIC image uploads for vendor registration.
 *
 * @return string Web path beginning with /uploads/...
 */
function saveVendorRegistrationCnic(array $file, int $userId, string $side): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'CNIC ' . $side . ' upload failed'], 422);
    }
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    $tmp = $file['tmp_name'];
    if (!is_uploaded_file($tmp)) {
        jsonResponse(['error' => 'Invalid CNIC ' . $side . ' upload'], 422);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp);
    if (!in_array($mime, $allowed, true)) {
        jsonResponse(['error' => 'CNIC ' . $side . ' must be JPG, PNG, or WebP'], 422);
    }
    if (($file['size'] ?? 0) > 3 * 1024 * 1024) {
        jsonResponse(['error' => 'CNIC ' . $side . ' image too large (max 3MB)'], 422);
    }
    $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $ext = $extMap[$mime];
    $dir = __DIR__ . '/../../uploads/vendor_cnic';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $fileName = 'cnic_u' . $userId . '_' . $side . '_' . uniqid('', true) . '.' . $ext;
    $target = $dir . '/' . $fileName;
    if (!move_uploaded_file($tmp, $target)) {
        jsonResponse(['error' => 'Could not save CNIC ' . $side], 500);
    }
    return '/uploads/vendor_cnic/' . $fileName;
}

function ensureVendorCnicColumns(PDO $pdo): void
{
    try {
        $pdo->exec('ALTER TABLE vendors ADD COLUMN cnic_front_path VARCHAR(512) NULL');
    } catch (Throwable $e) {
        // column may already exist
    }
    try {
        $pdo->exec('ALTER TABLE vendors ADD COLUMN cnic_back_path VARCHAR(512) NULL');
    } catch (Throwable $e) {
        // column may already exist
    }
}

$action = $_GET['action'] ?? '';
$data = getRequestData();

if ($action === 'register') {
    requireFields($data, ['name', 'email', 'password']);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 422);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email already exists'], 409);
    }

    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        trim($data['name']),
        trim($data['email']),
        trim($data['phone'] ?? ''),
        $password,
        'customer'
    ]);
    jsonResponse(['message' => 'Registration successful']);
}

if ($action === 'login') {
    requireFields($data, ['email', 'password']);
    $stmt = $pdo->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
    $stmt->execute([trim($data['email'])]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    unset($_SESSION['vendor_id'], $_SESSION['admin_id']);
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['role'] = (string) $user['role'];
    unset($user['password']);
    jsonResponse(['message' => 'Login successful', 'user' => $user]);
}

if ($action === 'vendor-register') {
    ensureVendorCnicColumns($pdo);

    $fromForm = isset($_FILES['cnic_front'], $_FILES['cnic_back']) && !empty($_POST['email']);
    if (!$fromForm) {
        jsonResponse(['error' => 'CNIC front and CNIC back images are required'], 422);
    }

    $data = [
        'name' => trim((string) ($_POST['name'] ?? '')),
        'email' => trim((string) ($_POST['email'] ?? '')),
        'password' => (string) ($_POST['password'] ?? ''),
        'store_name' => trim((string) ($_POST['store_name'] ?? '')),
        'phone' => trim((string) ($_POST['phone'] ?? '')),
        'description' => trim((string) ($_POST['description'] ?? '')),
    ];

    requireFields($data, ['name', 'email', 'password', 'store_name']);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 422);
    }

    $existsStmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $existsStmt->execute([$data['email']]);
    if ($existsStmt->fetch()) {
        jsonResponse(['error' => 'Email already exists'], 409);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            'vendor'
        ]);
        $userId = (int) $pdo->lastInsertId();

        $cnicFront = saveVendorRegistrationCnic($_FILES['cnic_front'], $userId, 'front');
        $cnicBack = saveVendorRegistrationCnic($_FILES['cnic_back'], $userId, 'back');

        $stmt = $pdo->prepare(
            'INSERT INTO vendors (user_id, store_name, description, status, cnic_front_path, cnic_back_path) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $data['store_name'], $data['description'], 'pending', $cnicFront, $cnicBack]);

        $pdo->commit();
        jsonResponse(['message' => 'Vendor registered and pending approval']);
    } catch (Throwable $throwable) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Vendor registration failed'], 500);
    }
}

if ($action === 'vendor-login') {
    requireFields($data, ['email', 'password']);
    $stmt = $pdo->prepare('SELECT u.id, u.name, u.email, u.password, v.id AS vendor_id, v.store_name, v.status
        FROM users u JOIN vendors v ON v.user_id = u.id WHERE u.email = ? AND u.role = ?');
    $stmt->execute([trim($data['email']), 'vendor']);
    $vendor = $stmt->fetch();

    if (!$vendor || !password_verify($data['password'], $vendor['password'])) {
        jsonResponse(['error' => 'Invalid vendor credentials'], 401);
    }
    if ($vendor['status'] !== 'approved') {
        jsonResponse(['error' => 'Vendor is not approved yet'], 403);
    }

    unset($_SESSION['admin_id']);
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $vendor['id'];
    $_SESSION['vendor_id'] = (int) $vendor['vendor_id'];
    $_SESSION['role'] = 'vendor';
    unset($vendor['password']);
    jsonResponse(['message' => 'Vendor login successful', 'vendor' => $vendor]);
}

if ($action === 'admin-login') {
    requireFields($data, ['email', 'password']);
    $stmt = $pdo->prepare('SELECT id, name, email, password FROM admins WHERE email = ?');
    $stmt->execute([trim($data['email'])]);
    $admin = $stmt->fetch();
    if (!$admin || !password_verify($data['password'], $admin['password'])) {
        jsonResponse(['error' => 'Invalid admin credentials'], 401);
    }

    unset($_SESSION['user_id'], $_SESSION['vendor_id']);
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $admin['id'];
    $_SESSION['role'] = 'admin';
    unset($admin['password']);
    jsonResponse(['message' => 'Admin login successful', 'admin' => $admin]);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (session_id() !== '' && isset($_COOKIE[session_name()])) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 420000, $p['path'], $p['domain'] ?: '', $p['secure'], $p['httponly']);
    }
    session_destroy();
    jsonResponse(['message' => 'Logged out']);
}

jsonResponse(['error' => 'Unknown action'], 404);
