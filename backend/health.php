<?php
declare(strict_types=1);

header('Content-Type: application/json');

require_once __DIR__ . '/config/database.php';

$dbOk = isset($pdo) && $pdo instanceof PDO;

http_response_code($dbOk ? 200 : 500);
echo json_encode([
    'status' => $dbOk ? 'ok' : 'error',
    'service' => 'backend',
    'database' => $dbOk ? 'connected' : 'failed',
    'timestamp' => date(DATE_ATOM),
]);
