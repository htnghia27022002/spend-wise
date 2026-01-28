<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Http\Controllers\Controller;
use App\Repositories\Notification\NotificationRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationRepository $repository,
        private readonly NotificationServiceInterface $service,
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 20);
        $notifications = $this->repository->getPaginatedByUser(auth()->id(), $perPage);
        $unreadCount = $this->repository->countUnreadByUser(auth()->id());

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function getUnread(): JsonResponse
    {
        $notifications = $this->repository->getUnreadByUser(auth()->id());
        $count = count($notifications);

        return response()->json([
            'count' => $count,
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $this->service->markAsRead($id, auth()->id());

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->service->markAllAsRead(auth()->id());

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function settings(Request $request): Response
    {
        $user = auth()->user();
        $settings = $user->notificationSettings ?? $user->notificationSettings()->create([
            'preferences' => [],
            'enabled_channels' => ['database'],
        ]);

        return Inertia::render('Notifications/Settings', [
            'settings' => $settings,
            'availableTypes' => $this->service->getAvailableNotificationTypes(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'enabled_channels' => 'required|array',
            'enabled_channels.*' => 'string|in:database,email,sms,push',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
            'timezone' => 'nullable|string|timezone',
        ]);

        $this->service->updateSettings(auth()->id(), $validated);

        return response()->json(['message' => 'Notification settings updated']);
    }

    public function getSettings(): JsonResponse
    {
        $user = auth()->user();
        $settings = $user->notificationSettings ?? $user->notificationSettings()->create([
            'preferences' => [],
            'enabled_channels' => ['database'],
        ]);

        return response()->json([
            'settings' => $settings,
            'availableTypes' => $this->service->getAvailableNotificationTypes(),
        ]);
    }
}
