<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Contracts\Finance\SubscriptionServiceInterface;
use App\Http\Controllers\Controller;
use App\Repositories\Finance\CategoryRepository;
use App\Repositories\Finance\SubscriptionRepository;
use App\Repositories\Finance\WalletRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionRepository $repository,
        private readonly WalletRepository $walletRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly SubscriptionServiceInterface $service,
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 50);
        $status = $request->input('status');

        $query = $status
            ? $this->repository->getByUserAndStatus(auth()->id(), $status, $perPage)
            : $this->repository->getPaginatedByUser(auth()->id(), $perPage);

        return Inertia::render('Finance/Subscriptions/Index', [
            'subscriptions' => $query,
            'filters' => ['status' => $status],
        ]);
    }

    public function create(): Response
    {
        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $expenseCategories = $this->categoryRepository->getByUserAndType(auth()->id(), 'expense');

        return Inertia::render('Finance/Subscriptions/Create', [
            'wallets' => $wallets,
            'categories' => $expenseCategories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'due_day' => 'nullable|integer|min:1|max:31',
            'description' => 'nullable|string',
        ]);

        // Verify authorization
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $subscription = $this->service->create(auth()->id(), $validated);

        return response()->json($subscription, 201);
    }

    public function edit(int $id): Response
    {
        $subscription = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $subscription) {
            abort(404);
        }

        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $expenseCategories = $this->categoryRepository->getByUserAndType(auth()->id(), 'expense');

        return Inertia::render('Finance/Subscriptions/Edit', [
            'subscription' => $subscription,
            'wallets' => $wallets,
            'categories' => $expenseCategories,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $subscription = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $subscription) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'due_day' => 'nullable|integer|min:1|max:31',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,paused,ended',
        ]);

        // Verify authorization
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $subscription = $this->service->update($subscription, $validated);

        return response()->json($subscription);
    }

    public function destroy(int $id): JsonResponse
    {
        $subscription = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $subscription) {
            abort(404);
        }

        $this->service->delete($subscription);

        return response()->json(null, 204);
    }

    public function pause(int $id): JsonResponse
    {
        $subscription = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $subscription) {
            abort(404);
        }

        $subscription = $this->service->pause($subscription);

        return response()->json($subscription);
    }

    public function resume(int $id): JsonResponse
    {
        $subscription = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $subscription) {
            abort(404);
        }

        $subscription = $this->service->resume($subscription);

        return response()->json($subscription);
    }

    private function authorizeWallet(int $walletId): void
    {
        if (! $this->walletRepository->findByIdAndUser($walletId, auth()->id())) {
            abort(403);
        }
    }

    private function authorizeCategory(int $categoryId): void
    {
        if (! $this->categoryRepository->findByIdAndUser($categoryId, auth()->id())) {
            abort(403);
        }
    }
}
