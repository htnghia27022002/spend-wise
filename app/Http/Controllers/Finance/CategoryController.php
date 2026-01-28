<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Contracts\Finance\CategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Repositories\Finance\CategoryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryRepository $repository,
        private readonly CategoryServiceInterface $service,
    ) {}

    public function index(): Response
    {
        $categories = $this->repository->getAllByUser(auth()->id());

        return Inertia::render('Finance/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $parentCategories = $this->repository->getRootsByUser(auth()->id());

        return Inertia::render('Finance/Categories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:income,expense',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'icon' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'description' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['order'] = $this->repository->getByUserAndType(auth()->id(), $validated['type'])->count();

        $category = $this->service->create(auth()->id(), $validated);

        return response()->json($category, 201);
    }

    public function edit(int $id): Response
    {
        $category = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $category) {
            abort(404);
        }

        $parentCategories = $this->repository->getRootsByUser(auth()->id());

        return Inertia::render('Finance/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $category) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:income,expense',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'icon' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $category = $this->service->update($category, $validated);

        return response()->json($category);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $category) {
            abort(404);
        }

        $this->service->delete($category);

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer',
        ]);

        $this->service->reorder(auth()->id(), $validated['order']);

        return response()->json(['message' => 'Categories reordered successfully']);
    }
}
