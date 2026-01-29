<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Contracts\Finance\InstallmentServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Finance\InstallmentPayment;
use App\Repositories\Finance\CategoryRepository;
use App\Repositories\Finance\InstallmentRepository;
use App\Repositories\Finance\WalletRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class InstallmentController extends Controller
{
    public function __construct(
        private readonly InstallmentRepository $repository,
        private readonly WalletRepository $walletRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly InstallmentServiceInterface $service,
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 50);
        $status = $request->input('status');

        $query = $status
            ? $this->repository->getByUserAndStatus(auth()->id(), $status, $perPage)
            : $this->repository->getPaginatedByUser(auth()->id(), $perPage);

        return Inertia::render('Finance/Installments/Index', [
            'installments' => $query,
            'filters' => ['status' => $status],
        ]);
    }

    public function create(): Response
    {
        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $expenseCategories = $this->categoryRepository->getByUserAndType(auth()->id(), 'expense');

        return Inertia::render('Finance/Installments/Create', [
            'wallets' => $wallets,
            'categories' => $expenseCategories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'total_amount' => 'required|numeric|min:0.01',
            'total_installments' => 'required|integer|min:2',
            'amount_per_installment' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'due_day' => 'nullable|integer|min:1|max:31',
            'description' => 'nullable|string',
        ]);

        // Verify authorization
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $installment = $this->service->create(auth()->id(), $validated);

        return redirect()->route('installments.index');
    }

    public function show(int $id): Response
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        return Inertia::render('Finance/Installments/Show', [
            'installment' => $installment,
        ]);
    }

    public function edit(int $id): Response
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        $wallets = $this->walletRepository->getActiveByUser(auth()->id());
        $expenseCategories = $this->categoryRepository->getByUserAndType(auth()->id(), 'expense');

        return Inertia::render('Finance/Installments/Edit', [
            'installment' => $installment,
            'wallets' => $wallets,
            'categories' => $expenseCategories,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wallet_id' => 'required|integer|exists:wallets,id',
            'category_id' => 'required|integer|exists:categories,id',
            'total_amount' => 'required|numeric|min:0.01',
            'total_installments' => 'required|integer|min:2',
            'amount_per_installment' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'due_day' => 'nullable|integer|min:1|max:31',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,paused,completed',
        ]);

        // Verify authorization
        $this->authorizeWallet($validated['wallet_id']);
        $this->authorizeCategory($validated['category_id']);

        $installment = $this->service->update($installment, $validated);

        return response()->json($installment);
    }

    public function destroy(int $id): JsonResponse
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        $this->service->delete($installment);

        return response()->json(null, 204);
    }

    public function pause(int $id): JsonResponse
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        $installment = $this->service->pause($installment);

        return response()->json($installment);
    }

    public function resume(int $id): JsonResponse
    {
        $installment = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $installment) {
            abort(404);
        }

        $installment = $this->service->resume($installment);

        return response()->json($installment);
    }

    public function markPaymentPaid(int $id, Request $request): JsonResponse
    {
        $payment = InstallmentPayment::find($id);

        if (! $payment || $payment->installment->user_id !== auth()->id()) {
            abort(404);
        }

        $validated = $request->validate([
            'paid_date' => 'required|date',
            'paid_amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $this->service->markPaymentAsPaid($payment->id, $validated);

        return response()->json(['message' => 'Payment marked as paid']);
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
