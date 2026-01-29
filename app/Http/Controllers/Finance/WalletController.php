<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Contracts\Finance\WalletServiceInterface;
use App\Http\Controllers\Controller;
use App\Repositories\Finance\WalletRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WalletController extends Controller
{
    public function __construct(
        private readonly WalletRepository $repository,
        private readonly WalletServiceInterface $service,
    ) {}

    public function index(): Response
    {
        $wallets = $this->repository->getAllByUser(auth()->id());

        return Inertia::render('Finance/Wallets/Index', [
            'wallets' => $wallets,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Finance/Wallets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,bank,ewallet,credit_card,other',
            'balance' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'description' => 'nullable|string',
        ]);

        $wallet = $this->service->create(auth()->id(), $validated);

        return redirect()->route('wallets.index');
    }

    public function show(int $id): Response
    {
        $wallet = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $wallet) {
            abort(404);
        }

        return Inertia::render('Finance/Wallets/Show', [
            'wallet' => $wallet->load('transactions'),
        ]);
    }

    public function edit(int $id): Response
    {
        $wallet = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $wallet) {
            abort(404);
        }

        return Inertia::render('Finance/Wallets/Edit', [
            'wallet' => $wallet,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $wallet = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $wallet) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,bank,ewallet,credit_card,other',
            'currency' => 'required|string|size:3',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $wallet = $this->service->update($wallet, $validated);

        return response()->json($wallet);
    }

    public function destroy(int $id): JsonResponse
    {
        $wallet = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $wallet) {
            abort(404);
        }

        $this->service->delete($wallet);

        return response()->json(null, 204);
    }
}
