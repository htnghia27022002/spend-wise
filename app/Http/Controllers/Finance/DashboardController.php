<?php

declare(strict_types=1);

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Repositories\Finance\CategoryRepository;
use App\Repositories\Finance\TransactionRepository;
use App\Repositories\Finance\WalletRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __construct(
        private readonly TransactionRepository $transactionRepository,
        private readonly WalletRepository $walletRepository,
        private readonly CategoryRepository $categoryRepository,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->input('period', 'month'); // month, quarter, year
        $startDate = $this->getStartDate($period);
        $endDate = Carbon::now();

        $userId = auth()->id();

        // Get wallet data
        $wallets = $this->walletRepository->getAllByUser($userId);
        $totalBalance = $wallets->sum('balance');

        // Get transaction summaries
        $income = $this->transactionRepository->sumByUserAndType($userId, 'income', $startDate, $endDate);
        $expense = $this->transactionRepository->sumByUserAndType($userId, 'expense', $startDate, $endDate);

        // Get expense breakdown by category
        $categories = $this->categoryRepository->getByUserAndType($userId, 'expense');
        $expenseByCategory = $categories->map(function ($category) use ($userId, $startDate, $endDate) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'amount' => $this->transactionRepository->sumByUserAndCategory($userId, $category->id, $startDate, $endDate),
            ];
        })->filter(fn ($item) => $item['amount'] > 0);

        // Get recent transactions
        $recentTransactions = $this->transactionRepository->getByUserAndDateRange($userId, $startDate, $endDate)
            ->take(10)
            ->values();

        // Get daily summary for chart
        $dailyData = $this->getDailySummary($userId, $startDate, $endDate);

        // Comparison with previous period
        $previousEndDate = $startDate->copy()->subDay();
        $previousStartDate = $this->getStartDate($period, $previousEndDate);

        $previousIncome = $this->transactionRepository->sumByUserAndType($userId, 'income', $previousStartDate, $previousEndDate);
        $previousExpense = $this->transactionRepository->sumByUserAndType($userId, 'expense', $previousStartDate, $previousEndDate);

        return Inertia::render('Finance/Dashboard', [
            'summary' => [
                'totalBalance' => $totalBalance,
                'income' => $income,
                'expense' => $expense,
                'difference' => $income - $expense,
            ],
            'comparison' => [
                'incomeChange' => $income - $previousIncome,
                'expenseChange' => $expense - $previousExpense,
            ],
            'expenseByCategory' => $expenseByCategory->values(),
            'recentTransactions' => $recentTransactions,
            'dailyData' => $dailyData,
            'wallets' => $wallets,
            'period' => $period,
        ]);
    }

    private function getStartDate(string $period, ?Carbon $referenceDate = null): Carbon
    {
        $reference = $referenceDate ?? Carbon::now();

        return match ($period) {
            'month' => $reference->copy()->startOfMonth(),
            'quarter' => $reference->copy()->startOfQuarter(),
            'year' => $reference->copy()->startOfYear(),
            default => $reference->copy()->startOfMonth(),
        };
    }

    private function getDailySummary(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $result = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $dayTransactions = $this->transactionRepository->getByUserAndDate($userId, $current);

            $result[] = [
                'date' => $current->format('Y-m-d'),
                'income' => $dayTransactions
                    ->where('type', 'income')
                    ->sum('amount'),
                'expense' => $dayTransactions
                    ->where('type', 'expense')
                    ->sum('amount'),
            ];

            $current->addDay();
        }

        return $result;
    }
}
