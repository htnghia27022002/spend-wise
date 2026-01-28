<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Contracts\Finance\TransactionServiceInterface;
use App\Http\Controllers\Controller;
use App\Repositories\Finance\CategoryRepository;
use App\Repositories\Finance\TransactionRepository;
use App\Repositories\Finance\WalletRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionRepository $transactionRepository,
        private readonly WalletRepository $walletRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly TransactionServiceInterface $service,
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 50);
        $type = $request->input('type');
        $categoryId = $request->input('category_id');
        $walletId = $request->input('wallet_id');

        $query = null;

        if ($type) {
            $query = $this->transactionRepository->getByUserAndType(auth()->id(), $type, $perPage);
        } elseif ($categoryId) {
            $query = $this->transactionRepository->getByUserAndCategory(auth()->id(), $categoryId, $perPage);
        } elseif ($walletId) {
            $query = $this->transactionRepository->getByUserAndWallet(auth()->id(), $walletId, $perPage);
        } else {
            $query = $this->transactionRepository->getPaginatedByUser(auth()->id(), $perPage);
        }

        $wallets = $this->walletRepository->getAllByUser(auth()->id());
        $categories = $this->categoryRepository->getAllByUser(auth()->id());

        return Inertia::render('Finance/Transactions/Index', [
            'transactions' => $query,
            'wallets' => $wallets,
            'categories' => $categories,
            'filters' => [
                'type' => $type,
                'category_id' => $categoryId,
                'wallet_id' => $walletId,
            ],
        ]);
    }

    public function create(): Response
    {
        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $categories = $this->categoryRepository->getActiveByUser(auth()->id());

        return Inertia::render('Finance/Transactions/Create', [
            'wallets' => $wallets,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $validated['user_id'] = auth()->id();

        // Verify user owns the wallet and category
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $transaction = $this->service->create(auth()->id(), $validated);

        return response()->json($transaction, 201);
    }

    public function edit(int $id): Response
    {
        $transaction = $this->transactionRepository->findByIdAndUser($id, auth()->id());

        if (! $transaction) {
            abort(404);
        }

        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $categories = $this->categoryRepository->getActiveByUser(auth()->id());

        return Inertia::render('Finance/Transactions/Edit', [
            'transaction' => $transaction,
            'wallets' => $wallets,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $transaction = $this->transactionRepository->findByIdAndUser($id, auth()->id());

        if (! $transaction) {
            abort(404);
        }

        $validated = $request->validate([
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        // Verify user owns the wallet and category
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $transaction = $this->service->update($transaction, $validated);

        return response()->json($transaction);
    }

    public function destroy(int $id): JsonResponse
    {
        $transaction = $this->transactionRepository->findByIdAndUser($id, auth()->id());

        if (! $transaction) {
            abort(404);
        }

        $this->service->delete($transaction);

        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $deleted = $this->service->bulkDelete($validated['ids'], auth()->id());

        return response()->json(['deleted' => $deleted]);
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
