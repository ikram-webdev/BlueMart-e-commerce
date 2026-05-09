<?php
declare(strict_types=1);

/**
 * SMTP AUTH LOGIN — SMTPS (465 / ssl) or STARTTLS + 587/tls — no Composer.
 */
function bluemart_smtp_native_send(
    string $host,
    int $port,
    string $user,
    string $pass,
    string $secure,
    bool $verifyPeer,
    string $fromEmail,
    string $to,
    string $subject,
    string $body
): bool {
    $secure = strtolower(trim($secure !== '' ? $secure : 'tls'));

    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => $verifyPeer,
            'verify_peer_name' => $verifyPeer,
            'crypto_method' => STREAM_CRYPTO_METHOD_TLS_CLIENT,
        ],
    ]);

    $implicitTls = ($secure === 'ssl' || $port === 465);
    $remote = $implicitTls ? "ssl://{$host}:{$port}" : "tcp://{$host}:{$port}";
    /** @var resource|false $fp */
    $fp = stream_socket_client(
        $remote,
        $errno,
        $errstr,
        40,
        STREAM_CLIENT_CONNECT,
        $ctx
    );
    if ($fp === false) {
        error_log("BlueMart SMTP connect failed: {$errstr} ({$errno}) {$remote}");

        return false;
    }

    stream_set_timeout($fp, 40);

    if (!smtp_native_expect_codes($fp, [220])) {
        fclose($fp);

        return false;
    }

    $domain = getenv('SMTP_EHLO_DOMAIN') ?: ($_SERVER['SERVER_NAME'] ?: 'localhost');
    fputs($fp, 'EHLO ' . $domain . "\r\n");
    if (!smtp_native_expect_codes($fp, [250])) {
        fputs($fp, 'HELO ' . $domain . "\r\n");
        if (!smtp_native_expect_codes($fp, [250])) {
            fclose($fp);

            return false;
        }
    }

    if (!$implicitTls && $secure !== 'none') {
        fputs($fp, "STARTTLS\r\n");
        if (!smtp_native_expect_codes($fp, [220])) {
            fclose($fp);

            return false;
        }
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            error_log('BlueMart SMTP: STARTTLS failed');

            fclose($fp);

            return false;
        }
        fputs($fp, 'EHLO ' . $domain . "\r\n");
        if (!smtp_native_expect_codes($fp, [250])) {
            fclose($fp);

            return false;
        }
    }

    fputs($fp, "AUTH LOGIN\r\n");
    if (!smtp_native_expect_codes($fp, [334])) {
        fclose($fp);

        return false;
    }
    fputs($fp, base64_encode($user) . "\r\n");
    if (!smtp_native_expect_codes($fp, [334])) {
        fclose($fp);

        return false;
    }
    fputs($fp, base64_encode($pass) . "\r\n");
    if (!smtp_native_expect_codes($fp, [235])) {
        error_log('BlueMart SMTP: authentication failed');

        fputs($fp, "QUIT\r\n");
        fclose($fp);

        return false;
    }

    fputs($fp, "MAIL FROM:<{$fromEmail}>\r\n");
    if (!smtp_native_expect_codes($fp, [250])) {
        fputs($fp, "QUIT\r\n");
        fclose($fp);

        return false;
    }
    fputs($fp, "RCPT TO:<{$to}>\r\n");
    if (!smtp_native_expect_codes($fp, [250, 251])) {
        fputs($fp, "QUIT\r\n");
        fclose($fp);

        return false;
    }
    fputs($fp, "DATA\r\n");
    if (!smtp_native_expect_codes($fp, [354])) {
        fputs($fp, "QUIT\r\n");
        fclose($fp);

        return false;
    }

    $normalized = preg_replace(["/\r\n/", "/\r/"], ["\n", "\n"], $body);
    $dotSafe = preg_replace('/^\./m', '..', $normalized);
    $mimeBody = str_replace("\n", "\r\n", $dotSafe);
    $mimeSub = preg_match('/[^\x20-\x7E]/u', $subject)
        ? ('=?UTF-8?B?' . base64_encode($subject) . '?=')
        : $subject;
    $b64 = trim(chunk_split(base64_encode($mimeBody), 76, "\r\n"));

    $mime =
        "From: BlueMart <{$fromEmail}>\r\n" .
        "To: <{$to}>\r\n" .
        "Subject: {$mimeSub}\r\n" .
        "MIME-Version: 1.0\r\n" .
        "Content-Type: text/plain; charset=UTF-8\r\n" .
        "Content-Transfer-Encoding: base64\r\n\r\n" .
        $b64 .
        "\r\n.\r\n";

    fputs($fp, $mime);

    if (!smtp_native_expect_codes($fp, [250])) {
        fputs($fp, "QUIT\r\n");
        fclose($fp);

        return false;
    }

    fputs($fp, "QUIT\r\n");
    fclose($fp);

    return true;
}

/** @param resource $fp */
function smtp_native_expect_codes($fp, array $accepted): bool
{
    while (($line = fgets($fp, 8192)) !== false) {
        $lineTrim = rtrim($line, "\r\n");
        if ($lineTrim === '') {
            continue;
        }
        if (!preg_match('/^(\d{3})(-| )/', $lineTrim, $m)) {
            continue;
        }
        $code = (int) $m[1];
        $sep = substr($lineTrim, 3, 1);
        $isFinalLine = ($sep !== '-');

        if (!$isFinalLine) {
            continue;
        }

        if (in_array($code, $accepted, true)) {
            return true;
        }
        error_log('BlueMart SMTP not accepted (' . implode(',', $accepted) . '): ' . $lineTrim);

        return false;
    }

    error_log('BlueMart SMTP: connection closed unexpectedly');

    return false;
}
