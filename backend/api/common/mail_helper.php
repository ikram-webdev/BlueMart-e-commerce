<?php
declare(strict_types=1);

/**
 * Load backend/.env as key => value (same style as database config).
 *
 * @return array<string, string>
 */
function bluemart_load_env_flat(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env';
    if (!is_file($path)) {
        return $cache = [];
    }

    $parsed = parse_ini_file($path, false, INI_SCANNER_RAW);
    return $cache = is_array($parsed) ? $parsed : [];
}

/**
 * Send one plain-text email. Uses SMTP when configured in .env, otherwise PHP mail().
 * Always appends to a dev log file when MAIL_LOG=1 (see .env.example).
 *
 * @return bool True if SMTP/mail() reported success, or if only file-log was used (always true for log-only path when file written).
 */
function bluemart_send_mail(string $to, string $subject, string $body, ?string $fromOverride = null): bool
{
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        error_log("BlueMart mail: invalid to address: {$to}");
        return false;
    }

    $env = bluemart_load_env_flat();
    $from = $fromOverride ?? ($env['MAIL_FROM'] ?? 'noreply@bluemart.local');
    $logEnabled = isset($env['MAIL_LOG']) && strtolower(trim((string) $env['MAIL_LOG'])) === '1';

    $logWritten = false;
    if ($logEnabled) {
        $dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $path = $dir . DIRECTORY_SEPARATOR . 'mail-outbox.log';
        $sep = "\n" . str_repeat('-', 60) . "\n";
        $block = sprintf(
            "%sTo: %s\nFrom: %s\nSubject: %s\n\n%s%s",
            $sep,
            $to,
            $from,
            $subject,
            $body,
            $sep
        );
        $logWritten = (bool) file_put_contents($path, $block . "\n", FILE_APPEND | LOCK_EX);
    }

    $smtpHost = trim((string) ($env['MAIL_SMTP_HOST'] ?? ''));
    $smtpUser = trim((string) ($env['MAIL_SMTP_USER'] ?? ''));
    $smtpPass = (string) ($env['MAIL_SMTP_PASS'] ?? '');
    $smtpPort = (int) ($env['MAIL_SMTP_PORT'] ?? 587);
    $smtpSecure = strtolower(trim((string) ($env['MAIL_SMTP_SECURE'] ?? 'tls')));
    $smtpAutoTls = strtolower(trim((string) ($env['MAIL_SMTP_AUTO_TLS'] ?? '1'))) !== '0';

    $vendorAutoload = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
    $usePhpMailer = $smtpHost !== '' && $smtpUser !== '' && $smtpPass !== '' && is_file($vendorAutoload);
    $useNativeSmtp = $smtpHost !== '' && $smtpUser !== '' && $smtpPass !== '' && !$usePhpMailer;

    if ($usePhpMailer) {
        require_once $vendorAutoload;

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $smtpHost;
            $mail->Port = $smtpPort > 0 ? $smtpPort : 587;
            $mail->SMTPAuth = true;
            $mail->Username = $smtpUser;
            $mail->Password = $smtpPass;
            if ($smtpSecure === 'ssl') {
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($smtpSecure === 'tls' || $smtpSecure === '') {
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }
            $mail->SMTPAutoTLS = $smtpAutoTls;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(bluemart_extract_mail_from($from) ?: $smtpUser, 'BlueMart');
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body = $body;

            return $mail->send() || $logWritten;
        } catch (Throwable $e) {
            error_log('BlueMart SMTP mail error: ' . $e->getMessage());

            return $logWritten;
        }
    }

    if ($useNativeSmtp) {
        require_once __DIR__ . '/smtp_native.php';
        $verifyPeer = strtolower(trim((string) ($env['MAIL_SMTP_VERIFY_PEER'] ?? '1'))) !== '0';
        $fromEmailAddr = bluemart_extract_mail_from($from) ?: $smtpUser;
        $port = $smtpPort > 0 ? $smtpPort : 587;

        try {
            $nativeOk = bluemart_smtp_native_send(
                $smtpHost,
                $port,
                $smtpUser,
                $smtpPass,
                $smtpSecure !== '' ? $smtpSecure : 'tls',
                $verifyPeer,
                $fromEmailAddr,
                $to,
                $subject,
                $body
            );

            return $nativeOk || $logWritten;
        } catch (Throwable $e) {
            error_log('BlueMart native SMTP: ' . $e->getMessage());

            return $logWritten;
        }
    }

    // SMTP partly configured but missing password/user/host — avoid silent mail() fallback
    if ($smtpHost !== '' && ($smtpUser === '' || $smtpPass === '')) {
        error_log('BlueMart mail: MAIL_SMTP_HOST set but MAIL_SMTP_USER or MAIL_SMTP_PASS is missing.');
        return $logWritten;
    }

    $headers = $from !== '' ? "From: {$from}\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0" : 'Content-Type: text/plain; charset=UTF-8';

    $phpMailOk = @mail($to, $subject, $body, $headers);

    return $phpMailOk || $logWritten;
}

/** @internal */
function bluemart_extract_mail_from(string $fromHeader): string
{
    if (preg_match('/<([^>]+)>/', $fromHeader, $m)) {
        return trim($m[1]);
    }
    if (filter_var(trim($fromHeader), FILTER_VALIDATE_EMAIL)) {
        return trim($fromHeader);
    }

    return '';
}

function bluemart_mail_from_display(): string
{
    $env = bluemart_load_env_flat();

    return trim((string) ($env['MAIL_FROM'] ?? 'noreply@bluemart.local'));
}
