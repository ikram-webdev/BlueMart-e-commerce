<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();

if ($action === 'list') {
    $search = trim($_GET['search'] ?? '');
    $categoryId = (int) ($_GET['category_id'] ?? 0);
    $sort = $_GET['sort'] ?? 'latest';
    $page = max((int) ($_GET['page'] ?? 1), 1);
    $limit = 12;
    $offset = ($page - 1) * $limit;

    $where = 'WHERE 1=1';
    $params = [];
    if ($search !== '') {
        $where .= ' AND p.name LIKE ?';
        $params[] = '%' . $search . '%';
    }
    if ($categoryId > 0) {
        $where .= ' AND p.category_id = ?';
        $params[] = $categoryId;
    }

    $orderBy = 'p.created_at DESC';
    if ($sort === 'price_asc') {
        $orderBy = 'COALESCE(p.discount_price, p.price) ASC';
    } elseif ($sort === 'price_desc') {
        $orderBy = 'COALESCE(p.discount_price, p.price) DESC';
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM products p {$where}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];

    $sql = "SELECT p.*, c.name AS category_name, v.store_name
            FROM products p
            JOIN categories c ON c.id = p.category_id
            JOIN vendors v ON v.id = p.vendor_id
            {$where}
            ORDER BY {$orderBy}
            LIMIT {$limit} OFFSET {$offset}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    jsonResponse([
        'products' => $stmt->fetchAll(),
        'meta' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => (int) ceil($total / $limit),
        ],
    ]);
}

if ($action === 'single') {
    $id = (int) ($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT p.*, c.name AS category_name, v.store_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN vendors v ON v.id = p.vendor_id
        WHERE p.id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) {
        jsonResponse(['error' => 'Product not found'], 404);
    }

    $imagesStmt = $pdo->prepare('SELECT image_path FROM product_images WHERE product_id = ?');
    $imagesStmt->execute([$id]);
    $product['images'] = $imagesStmt->fetchAll();
    jsonResponse(['product' => $product]);
}

if ($action === 'create') {
    requireRole('vendor');
    requireFields($data, ['category_id', 'name', 'price', 'stock']);
    $stmt = $pdo->prepare('INSERT INTO products (vendor_id, category_id, name, slug, description, price, discount_price, stock, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        (int) $_SESSION['vendor_id'],
        (int) $data['category_id'],
        trim($data['name']),
        slugify($data['name']) . '-' . time(),
        trim($data['description'] ?? ''),
        (float) $data['price'],
        isset($data['discount_price']) ? (float) $data['discount_price'] : null,
        (int) $data['stock'],
        trim($data['thumbnail'] ?? 'https://via.placeholder.com/280x220?text=Product'),
    ]);
    jsonResponse([
        'message' => 'Product created',
        'product_id' => (int) $pdo->lastInsertId(),
    ]);
}

if ($action === 'update') {
    requireRole('vendor');
    requireFields($data, ['id', 'category_id', 'name', 'price', 'stock']);
    $stmt = $pdo->prepare('UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, discount_price = ?, stock = ?, thumbnail = ?
        WHERE id = ? AND vendor_id = ?');
    $stmt->execute([
        (int) $data['category_id'],
        trim($data['name']),
        trim($data['description'] ?? ''),
        (float) $data['price'],
        isset($data['discount_price']) ? (float) $data['discount_price'] : null,
        (int) $data['stock'],
        trim($data['thumbnail'] ?? 'https://via.placeholder.com/280x220?text=Product'),
        (int) $data['id'],
        (int) $_SESSION['vendor_id'],
    ]);
    jsonResponse(['message' => 'Product updated']);
}

if ($action === 'delete') {
    requireRole('vendor');
    requireFields($data, ['id']);
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ? AND vendor_id = ?');
    $stmt->execute([(int) $data['id'], (int) $_SESSION['vendor_id']]);
    jsonResponse(['message' => 'Product deleted']);
}

if ($action === 'upload-image') {
    requireRole('vendor');
    if (!isset($_FILES['image']) || !isset($_POST['product_id'])) {
        jsonResponse(['error' => 'Image and product ID are required'], 422);
    }

    $productId = (int) $_POST['product_id'];
    $file = $_FILES['image'];
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($file['type'], $allowed, true)) {
        jsonResponse(['error' => 'Unsupported image type'], 422);
    }
    if ($file['size'] > 2 * 1024 * 1024) {
        jsonResponse(['error' => 'Image too large (max 2MB)'], 422);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('prd_', true) . '.' . $ext;
    $target = __DIR__ . '/../../uploads/' . $fileName;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        jsonResponse(['error' => 'Image upload failed'], 500);
    }

    $path = '/uploads/' . $fileName;
    $ownerStmt = $pdo->prepare('SELECT id FROM products WHERE id = ? AND vendor_id = ? LIMIT 1');
    $ownerStmt->execute([$productId, (int) $_SESSION['vendor_id']]);
    if (!$ownerStmt->fetch()) {
        jsonResponse(['error' => 'Product not found for this vendor'], 404);
    }

    $stmt = $pdo->prepare('INSERT INTO product_images (product_id, image_path) VALUES (?, ?)');
    $stmt->execute([$productId, $path]);

    $thumbStmt = $pdo->prepare('UPDATE products SET thumbnail = ? WHERE id = ? AND vendor_id = ?');
    $thumbStmt->execute([$path, $productId, (int) $_SESSION['vendor_id']]);

    jsonResponse(['message' => 'Image uploaded', 'image_path' => $path]);
}

jsonResponse(['error' => 'Unknown action'], 404);
