<?php

declare(strict_types=1);

namespace App\Contracts\Finance;

use App\Models\Finance\Category;

interface CategoryServiceInterface
{
    public function create(int $userId, array $data): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): bool;

    public function reorder(int $userId, array $orderData): void;
}
