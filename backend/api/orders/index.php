<?php
declare(strict_types=1);
require_once __DIR__ . '/../common/bootstrap.php';
require_once __DIR__ . '/../common/mail_helper.php';

$action = $_GET['action'] ?? '';
$data = getRequestData();

function ensureOrderPaymentColumns(PDO $pdo): void
{
    $columns = $pdo->query('SHOW COLUMNS FROM orders')->fetchAll();
    $existing = [];
    foreach ($columns as $col) {
        $existing[(string) ($col['Field'] ?? '')] = true;
    }

    if (!isset($existing['payment_status'])) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER payment_method");
    }
    if (!isset($existing['payment_reference'])) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(120) NULL AFTER payment_status");
    }
    if (!isset($existing['payment_gateway'])) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_gateway VARCHAR(40) NULL AFTER payment_reference");
    }
}

function sendOrderEmails(PDO $pdo, int $orderId, string $customerEmail, string $customerName): void
{
    $fromAddr = bluemart_mail_from_display();

    // ---------- Customer ----------
    $subjectCustomer = "[BlueMart] Order confirmed #" . $orderId;
    $messageCustomer =
        "Assalam-o-Alaikum {$customerName},\r\n\r\n" .
        "Your order #{$orderId} has been placed successfully on BlueMart.\r\n" .
        "We will notify you when the status updates.\r\n\r\n" .
        "Thank you for shopping with us.\r\n" .
        "— BlueMart";

    $customerOk = bluemart_send_mail($customerEmail, $subjectCustomer, $messageCustomer, $fromAddr);
    if (!$customerOk) {
        error_log("BlueMart: customer order mail failed for order #{$orderId}, to={$customerEmail}");
    }

    // ---------- Vendor(s) tied to products in this order ----------
    $vendorStmt = $pdo->prepare(
        'SELECT DISTINCT u.email, v.store_name
        FROM order_items oi
        JOIN vendors v ON v.id = oi.vendor_id
        JOIN users u ON u.id = v.user_id
        WHERE oi.order_id = ?'
    );
    $vendorStmt->execute([$orderId]);
    $vendors = $vendorStmt->fetchAll();

    foreach ($vendors as $vendor) {
        $vendorEmail = trim((string) ($vendor['email'] ?? ''));
        if ($vendorEmail === '' || !filter_var($vendorEmail, FILTER_VALIDATE_EMAIL)) {
            continue;
        }
        $storeName = (string) ($vendor['store_name'] ?? 'Vendor');
        $subjectVendor = "[BlueMart] New order #" . $orderId . " for " . $storeName;
        $messageVendor =
            "Hello {$storeName},\r\n\r\n" .
            "A customer has placed a new order (#{$orderId}) on BlueMart that includes your product(s).\r\n\r\n" .
            "Please log in to your vendor dashboard to view items, quantities, and fulfil the order.\r\n\r\n" .
            "— BlueMart";

        $vendorOk = bluemart_send_mail($vendorEmail, $subjectVendor, $messageVendor, $fromAddr);
        if (!$vendorOk) {
            error_log("BlueMart: vendor order mail failed for order #{$orderId}, to={$vendorEmail}");
        }
    }
}

if ($action === 'place') {
    requireCustomerSession();
    requireFields($data, ['customer_name', 'email', 'phone', 'address', 'city']);
    ensureOrderPaymentColumns($pdo);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 422);
    }

    $paymentMethodInput = strtolower(trim((string) ($data['payment_method'] ?? 'cod')));
    $isOnlinePayment = in_array($paymentMethodInput, ['online', 'online_gateway', 'card'], true);
    $paymentMethod = $isOnlinePayment ? 'Online Gateway' : 'Cash on Delivery';
    $paymentStatus = $isOnlinePayment ? 'paid' : 'pending';
    $paymentReference = null;
    $paymentGateway = null;

    if ($isOnlinePayment) {
        $paymentGateway = strtolower(trim((string) ($data['payment_gateway'] ?? '')));
        $allowedGateways = ['jazzcash', 'easypaisa', 'bank_card'];
        if (!in_array($paymentGateway, $allowedGateways, true)) {
            jsonResponse(['error' => 'Please select a valid Pakistani payment gateway.'], 422);
        }

        if ($paymentGateway === 'jazzcash') {
            $mobile = preg_replace('/\D+/', '', (string) ($data['jazzcash_mobile'] ?? ''));
            $cnic = preg_replace('/\D+/', '', (string) ($data['jazzcash_cnic'] ?? ''));
            if (strlen($mobile) < 11 || strlen($cnic) < 13) {
                jsonResponse(['error' => 'JazzCash payment requires valid mobile number and CNIC.'], 422);
            }
            $paymentReference = 'JAZZCASH-PAY-' . time() . '-' . substr($mobile, -4);
        } elseif ($paymentGateway === 'easypaisa') {
            $mobile = preg_replace('/\D+/', '', (string) ($data['easypaisa_mobile'] ?? ''));
            $cnic = preg_replace('/\D+/', '', (string) ($data['easypaisa_cnic'] ?? ''));
            if (strlen($mobile) < 11 || strlen($cnic) < 13) {
                jsonResponse(['error' => 'Easypaisa payment requires valid account number and CNIC.'], 422);
            }
            $paymentReference = 'EASYPAISA-PAY-' . time() . '-' . substr($mobile, -4);
        } else {
            $cardNumber = preg_replace('/\D+/', '', (string) ($data['card_number'] ?? ''));
            $cardName = trim((string) ($data['card_name'] ?? ''));
            $cardExpiry = trim((string) ($data['card_expiry'] ?? ''));
            $cardCvv = preg_replace('/\D+/', '', (string) ($data['card_cvv'] ?? ''));
            $bankName = trim((string) ($data['bank_name'] ?? ''));

            if (strlen($cardNumber) < 12 || strlen($cardCvv) < 3 || $cardName === '' || $cardExpiry === '' || $bankName === '') {
                jsonResponse(['error' => 'Bank card payment requires valid bank/card details.'], 422);
            }
            $paymentReference = 'BANKCARD-PAY-' . time() . '-' . substr($cardNumber, -4);
        }
    }

    $cartStmt = $pdo->prepare('SELECT c.product_id, c.quantity, p.vendor_id, p.price, p.discount_price
        FROM carts c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?');
    $cartStmt->execute([(int) $_SESSION['user_id']]);
    $items = $cartStmt->fetchAll();
    if (!$items) {
        jsonResponse(['error' => 'Cart is empty'], 422);
    }

    $total = 0.0;
    foreach ($items as $item) {
        $price = (float) ($item['discount_price'] ?? $item['price']);
        $total += $price * (int) $item['quantity'];
    }

    $pdo->beginTransaction();
    try {
        $orderStmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, email, phone, address, city, payment_method, payment_status, payment_reference, payment_gateway, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $orderStmt->execute([
            (int) $_SESSION['user_id'],
            trim($data['customer_name']),
            trim($data['email']),
            trim($data['phone']),
            trim($data['address']),
            trim($data['city']),
            $paymentMethod,
            $paymentStatus,
            $paymentReference,
            $paymentGateway,
            $total,
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price)
            VALUES (?, ?, ?, ?, ?)');
        foreach ($items as $item) {
            $unitPrice = (float) ($item['discount_price'] ?? $item['price']);
            $itemStmt->execute([$orderId, (int) $item['product_id'], (int) $item['vendor_id'], (int) $item['quantity'], $unitPrice]);
        }

        $clearStmt = $pdo->prepare('DELETE FROM carts WHERE user_id = ?');
        $clearStmt->execute([(int) $_SESSION['user_id']]);
        $pdo->commit();
        sendOrderEmails($pdo, $orderId, trim($data['email']), trim($data['customer_name']));
        jsonResponse([
            'message' => 'Order placed successfully',
            'order_id' => $orderId,
            'payment' => [
                'method' => $paymentMethod,
                'status' => $paymentStatus,
                'reference' => $paymentReference,
                'gateway' => $paymentGateway,
            ],
        ]);
    } catch (Throwable $throwable) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Failed to place order'], 500);
    }
}

if ($action === 'place-direct') {
    requireRole('customer');
    requireFields($data, ['customer_name', 'email', 'phone', 'address', 'city', 'product_id', 'quantity']);
    ensureOrderPaymentColumns($pdo);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 422);
    }

    $productId = (int) $data['product_id'];
    $quantity = max(1, (int) $data['quantity']);
    $productStmt = $pdo->prepare('SELECT id, vendor_id, price, discount_price FROM products WHERE id = ? LIMIT 1');
    $productStmt->execute([$productId]);
    $product = $productStmt->fetch();
    if (!$product) {
        jsonResponse(['error' => 'Product not found'], 404);
    }

    $paymentMethodInput = strtolower(trim((string) ($data['payment_method'] ?? 'cod')));
    $isOnlinePayment = in_array($paymentMethodInput, ['online', 'online_gateway', 'card'], true);
    $paymentMethod = $isOnlinePayment ? 'Online Gateway' : 'Cash on Delivery';
    $paymentStatus = $isOnlinePayment ? 'paid' : 'pending';
    $paymentReference = null;
    $paymentGateway = null;

    if ($isOnlinePayment) {
        $paymentGateway = strtolower(trim((string) ($data['payment_gateway'] ?? '')));
        $allowedGateways = ['jazzcash', 'easypaisa', 'bank_card'];
        if (!in_array($paymentGateway, $allowedGateways, true)) {
            jsonResponse(['error' => 'Please select a valid Pakistani payment gateway.'], 422);
        }

        if ($paymentGateway === 'jazzcash') {
            $mobile = preg_replace('/\D+/', '', (string) ($data['jazzcash_mobile'] ?? ''));
            $cnic = preg_replace('/\D+/', '', (string) ($data['jazzcash_cnic'] ?? ''));
            if (strlen($mobile) < 11 || strlen($cnic) < 13) {
                jsonResponse(['error' => 'JazzCash payment requires valid mobile number and CNIC.'], 422);
            }
            $paymentReference = 'JAZZCASH-PAY-' . time() . '-' . substr($mobile, -4);
        } elseif ($paymentGateway === 'easypaisa') {
            $mobile = preg_replace('/\D+/', '', (string) ($data['easypaisa_mobile'] ?? ''));
            $cnic = preg_replace('/\D+/', '', (string) ($data['easypaisa_cnic'] ?? ''));
            if (strlen($mobile) < 11 || strlen($cnic) < 13) {
                jsonResponse(['error' => 'Easypaisa payment requires valid account number and CNIC.'], 422);
            }
            $paymentReference = 'EASYPAISA-PAY-' . time() . '-' . substr($mobile, -4);
        } else {
            $cardNumber = preg_replace('/\D+/', '', (string) ($data['card_number'] ?? ''));
            $cardName = trim((string) ($data['card_name'] ?? ''));
            $cardExpiry = trim((string) ($data['card_expiry'] ?? ''));
            $cardCvv = preg_replace('/\D+/', '', (string) ($data['card_cvv'] ?? ''));
            $bankName = trim((string) ($data['bank_name'] ?? ''));

            if (strlen($cardNumber) < 12 || strlen($cardCvv) < 3 || $cardName === '' || $cardExpiry === '' || $bankName === '') {
                jsonResponse(['error' => 'Bank card payment requires valid bank/card details.'], 422);
            }
            $paymentReference = 'BANKCARD-PAY-' . time() . '-' . substr($cardNumber, -4);
        }
    }

    $unitPrice = (float) ($product['discount_price'] ?? $product['price']);
    $total = $unitPrice * $quantity;

    $pdo->beginTransaction();
    try {
        $orderStmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, email, phone, address, city, payment_method, payment_status, payment_reference, payment_gateway, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $orderStmt->execute([
            (int) $_SESSION['user_id'],
            trim($data['customer_name']),
            trim($data['email']),
            trim($data['phone']),
            trim($data['address']),
            trim($data['city']),
            $paymentMethod,
            $paymentStatus,
            $paymentReference,
            $paymentGateway,
            $total,
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price)
            VALUES (?, ?, ?, ?, ?)');
        $itemStmt->execute([$orderId, $productId, (int) $product['vendor_id'], $quantity, $unitPrice]);

        $pdo->commit();
        sendOrderEmails($pdo, $orderId, trim($data['email']), trim($data['customer_name']));
        jsonResponse([
            'message' => 'Order placed successfully',
            'order_id' => $orderId,
            'payment' => [
                'method' => $paymentMethod,
                'status' => $paymentStatus,
                'reference' => $paymentReference,
                'gateway' => $paymentGateway,
            ],
        ]);
    } catch (Throwable $throwable) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Failed to place order'], 500);
    }
}

if ($action === 'customer-order') {
    requireCustomerSession();
    ensureOrderPaymentColumns($pdo);
    $id = (int) ($_GET['id'] ?? 0);
    if ($id < 1) {
        jsonResponse(['error' => 'Invalid order'], 422);
    }
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, (int) $_SESSION['user_id']]);
    $order = $stmt->fetch();
    if (!$order) {
        jsonResponse(['error' => 'Order not found'], 404);
    }
    $itemsStmt = $pdo->prepare(
        'SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.thumbnail
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?'
    );
    $itemsStmt->execute([$id]);
    jsonResponse(['order' => $order, 'items' => $itemsStmt->fetchAll()]);
}

if ($action === 'customer-list') {
    requireCustomerSession();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([(int) $_SESSION['user_id']]);
    jsonResponse(['orders' => $stmt->fetchAll()]);
}

if ($action === 'vendor-list') {
    requireRole('vendor');
    $stmt = $pdo->prepare('SELECT o.id, o.customer_name, o.phone, o.city, o.status, o.created_at,
        oi.product_id, oi.quantity, oi.unit_price
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.vendor_id = ?
        ORDER BY oi.id DESC');
    $stmt->execute([(int) $_SESSION['vendor_id']]);
    jsonResponse(['orders' => $stmt->fetchAll()]);
}

if ($action === 'admin-list') {
    requireRole('admin');
    $stmt = $pdo->query('SELECT * FROM orders ORDER BY id DESC');
    jsonResponse(['orders' => $stmt->fetchAll()]);
}

if ($action === 'admin-update-status') {
    requireRole('admin');
    requireFields($data, ['id', 'status']);
    $allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($data['status'], $allowed, true)) {
        jsonResponse(['error' => 'Invalid status'], 422);
    }
    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([trim($data['status']), (int) $data['id']]);
    jsonResponse(['message' => 'Order status updated']);
}

jsonResponse(['error' => 'Unknown action'], 404);
