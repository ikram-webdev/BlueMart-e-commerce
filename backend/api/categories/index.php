<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();

if ($action === 'list') {
    $stmt = $pdo->query('SELECT * FROM categories ORDER BY id DESC');
    jsonResponse(['categories' => $stmt->fetchAll()]);
}

if ($action === 'create') {
    requireRole('admin');
    requireFields($data, ['name']);
    $name = trim($data['name']);
    $slug = slugify($name);
    $stmt = $pdo->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    $stmt->execute([$name, $slug]);
    jsonResponse(['message' => 'Category created']);
}

if ($action === 'update') {
    requireRole('admin');
    requireFields($data, ['id', 'name']);
    $stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?');
    $stmt->execute([trim($data['name']), slugify($data['name']), (int) $data['id']]);
    jsonResponse(['message' => 'Category updated']);
}

if ($action === 'delete') {
    requireRole('admin');
    requireFields($data, ['id']);
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
    $stmt->execute([(int) $data['id']]);
    jsonResponse(['message' => 'Category deleted']);
}

jsonResponse(['error' => 'Unknown action'], 404);
