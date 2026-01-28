<?php

declare(strict_types=1);

namespace App\Services\Tools;

final class EncoderDecoderService
{
    public function encodeBase64(string $input): string
    {
        return base64_encode($input);
    }

    public function decodeBase64(string $input): string
    {
        $decoded = base64_decode($input, true);
        if ($decoded === false) {
            throw new \InvalidArgumentException('Invalid Base64 string');
        }
        return $decoded;
    }

    public function encodeHex(string $input): string
    {
        return bin2hex($input);
    }

    public function decodeHex(string $input): string
    {
        if (!ctype_xdigit($input)) {
            throw new \InvalidArgumentException('Invalid Hex string');
        }
        return hex2bin($input);
    }

    public function encodeUrl(string $input): string
    {
        return urlencode($input);
    }

    public function decodeUrl(string $input): string
    {
        return urldecode($input);
    }

    public function encodeJson(mixed $data): string
    {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    public function decodeJson(string $input): mixed
    {
        $decoded = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON: ' . json_last_error_msg());
        }
        return $decoded;
    }
}
