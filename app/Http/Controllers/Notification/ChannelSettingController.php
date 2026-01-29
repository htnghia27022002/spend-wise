<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Repositories\Notification\ChannelSettingRepository;
use App\Services\Notification\ChannelSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ChannelSettingController extends Controller
{
    public function __construct(
        private readonly ChannelSettingRepository $repository,
        private readonly ChannelSettingService $service,
    ) {}

    public function index(): Response
    {
        $settings = $this->repository->getAll();

        return Inertia::render('Notifications/ChannelSettings/Index', [
            'settings' => $settings,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel' => 'required|string|in:email,sms,push',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'configuration' => 'required|array',
        ]);

        $setting = $this->service->createOrUpdate($validated['channel'], $validated);

        return response()->json([
            'message' => 'Channel setting saved successfully',
            'setting' => $setting,
        ], 201);
    }

    public function update(Request $request, string $channel): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'configuration' => 'sometimes|array',
        ]);

        $setting = $this->service->createOrUpdate($channel, array_merge(
            ['channel' => $channel],
            $validated
        ));

        return response()->json([
            'message' => 'Channel setting updated successfully',
            'setting' => $setting,
        ]);
    }

    public function test(string $channel): JsonResponse
    {
        $result = $this->service->testConnection($channel);

        return response()->json($result);
    }

    public function destroy(string $channel): JsonResponse
    {
        $deleted = $this->service->delete($channel);

        if (!$deleted) {
            return response()->json([
                'message' => 'Channel setting not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Channel setting deleted successfully',
        ]);
    }

    public function activate(string $channel): JsonResponse
    {
        $activated = $this->service->activate($channel);

        if (!$activated) {
            return response()->json([
                'message' => 'Channel setting not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Channel activated successfully',
        ]);
    }

    public function deactivate(string $channel): JsonResponse
    {
        $deactivated = $this->service->deactivate($channel);

        if (!$deactivated) {
            return response()->json([
                'message' => 'Channel setting not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Channel deactivated successfully',
        ]);
    }
}
