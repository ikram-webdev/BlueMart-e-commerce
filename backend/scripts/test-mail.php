<?php
declare(strict_types=1);

/**
 * Usage (from repo root): php backend/scripts/test-mail.php your@email.com
 */

if ($argc < 2) {
    fwrite(STDERR, "Usage: php backend/scripts/test-mail.php <your-email>\n");
    exit(1);
}

$to = trim((string) $argv[1]);
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Invalid email.\n");
    exit(1);
}

require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'common' . DIRECTORY_SEPARATOR . 'mail_helper.php';

$from = bluemart_mail_from_display();
$subject = '[BlueMart] Mail test ' . date('Y-m-d H:i');
$body =
    "Test message from BlueMart mail helper.\r\n" .
    "If MAIL_SMTP_* is set in backend/.env with user+password, SMTP is used (built-in SMTP if composer vendor is absent, PHPMailer if installed).\r\n" .
    "If MAIL_LOG=1, also check backend/storage/mail-outbox.log\r\n" .
    'Time: ' . date('c') . "\r\n";

echo "To: {$to}\nFrom: {$from}\n";
$env = bluemart_load_env_flat();
if (!empty($env['MAIL_SMTP_HOST'])) {
    echo "SMTP: {$env['MAIL_SMTP_HOST']}:{$env['MAIL_SMTP_PORT']}\n";
} else {
    echo "SMTP: not set (falls back to php mail())\n";
}
echo "MAIL_LOG: " . (!empty($env['MAIL_LOG']) && $env['MAIL_LOG'] === '1' ? 'on' : 'off') . "\n\n";

$ok = bluemart_send_mail($to, $subject, $body, $from);
if ($ok) {
    echo "Result: helper returned success (check inbox + spam, and storage/mail-outbox.log if MAIL_LOG=1).\n";
    exit(0);
}

echo "Result: failed. Set MAIL_SMTP_* in backend/.env (host, user, app password); composer is optional. Or set MAIL_LOG=1 to capture messages in storage/mail-outbox.log.\n";
exit(2);
