<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tools;

use App\Http\Controllers\Controller;
use App\Services\Tools\EncoderDecoderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EncoderDecoderController extends Controller
{
    public function __construct(
        private EncoderDecoderService $encoderDecoderService,
    ) {}

    public function show(): Response
    {
        return Inertia::render('tools/encoder-decoder');
    }

    public function encode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'input' => 'required|string',
            'type' => 'required|in:base64,hex,url,json',
        ]);

        try {
            $result = match ($validated['type']) {
                'base64' => $this->encoderDecoderService->encodeBase64($validated['input']),
                'hex' => $this->encoderDecoderService->encodeHex($validated['input']),
                'url' => $this->encoderDecoderService->encodeUrl($validated['input']),
                'json' => $this->encoderDecoderService->encodeJson(json_decode($validated['input'], true)),
                default => throw new \InvalidArgumentException('Invalid encoding type'),
            };

            return response()->json(['result' => $result, 'success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'success' => false], 400);
        }
    }

    public function decode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'input' => 'required|string',
            'type' => 'required|in:base64,hex,url,json',
        ]);

        try {
            $result = match ($validated['type']) {
                'base64' => $this->encoderDecoderService->decodeBase64($validated['input']),
                'hex' => $this->encoderDecoderService->decodeHex($validated['input']),
                'url' => $this->encoderDecoderService->decodeUrl($validated['input']),
                'json' => $this->encoderDecoderService->decodeJson($validated['input']),
                default => throw new \InvalidArgumentException('Invalid decoding type'),
            };

            return response()->json(['result' => $result, 'success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'success' => false], 400);
        }
    }
}
