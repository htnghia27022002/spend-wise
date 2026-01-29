<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Repositories\Notification\TemplateRepository;
use App\Services\Notification\TemplateService;
use App\Services\Notification\NotificationTypeRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TemplateController extends Controller
{
    public function __construct(
        private readonly TemplateRepository $repository,
        private readonly TemplateService $service,
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 20);
        $templates = $this->repository->getPaginated($perPage);

        return Inertia::render('Notifications/Templates/Index', [
            'templates' => $templates,
            'availableTypes' => NotificationTypeRegistry::groupedByModule(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Notifications/Templates/Create', [
            'availableTypes' => NotificationTypeRegistry::groupedByModule(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'channel' => 'required|string|in:email,sms,push,database',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        $template = $this->service->create($validated);

        return redirect()->route('notification.templates.index');
    }

    public function show(int $id): Response
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        return Inertia::render('Notifications/Templates/Show', [
            'template' => $template,
        ]);
    }

    public function edit(int $id): Response
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        return Inertia::render('Notifications/Templates/Edit', [
            'template' => $template,
            'availableTypes' => NotificationTypeRegistry::groupedByModule(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'channel' => 'sometimes|string|in:email,sms,push,database',
            'subject' => 'nullable|string|max:255',
            'body' => 'sometimes|string',
            'variables' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
        ]);

        $template = $this->service->update($id, $validated);

        if (!$template) {
            return response()->json([
                'message' => 'Template not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->delete($id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Template not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Template deleted successfully',
        ]);
    }

    public function preview(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'sample_data' => 'required|array',
        ]);

        $preview = $this->service->preview($id, $validated['sample_data']);

        if (!$preview) {
            return response()->json([
                'message' => 'Template not found',
            ], 404);
        }

        return response()->json($preview);
    }
}
