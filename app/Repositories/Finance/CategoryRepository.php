<?php

declare(strict_types=1);

namespace App\Repositories\Finance;

use App\Models\Finance\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;

final class CategoryRepository
{
    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Category
    {
        return Category::where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    public function getAllByUser(int $userId): Collection
    {
        return Category::where('user_id', $userId)
            ->orderBy('order')
            ->get();
    }

    public function getActiveByUser(int $userId): Collection
    {
        return Category::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function getByUserAndType(int $userId, string $type): Collection
    {
        return Category::where('user_id', $userId)
            ->where('type', $type)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function getRootsByUser(int $userId): Collection
    {
        return Category::where('user_id', $userId)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->with('children')
            ->get();
    }

    public function getChildrenByParent(int $parentId): Collection
    {
        return Category::where('parent_id', $parentId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }
}
