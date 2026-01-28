<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Contracts\Finance\CategoryServiceInterface;
use App\Models\Finance\Category;

final class CategoryService implements CategoryServiceInterface
{
    public function create(int $userId, array $data): Category
    {
        $data['user_id'] = $userId;

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh();
    }

    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }

    public function reorder(int $userId, array $orderData): void
    {
        foreach ($orderData as $index => $categoryId) {
            Category::where('id', $categoryId)
                ->where('user_id', $userId)
                ->update(['order' => $index]);
        }
    }
}
