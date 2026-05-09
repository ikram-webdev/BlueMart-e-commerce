<?php
declare(strict_types=1);

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function getRequestData(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function requireFields(array $data, array $fields): void
{
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            jsonResponse(['error' => "Field '{$field}' is required"], 422);
        }
    }
}

function requireRole(string $role): void
{
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== $role) {
        jsonResponse(['error' => 'Unauthorized access'], 401);
    }
}

/** Customer APIs must scope by logged-in users.id (not stale vendor/admin sessions). */
function requireCustomerSession(): void
{
    requireRole('customer');
    $uid = (int) ($_SESSION['user_id'] ?? 0);
    if ($uid < 1) {
        jsonResponse(['error' => 'Invalid session. Please log out and log in again.'], 401);
    }
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim((string) $text, '-');
}
