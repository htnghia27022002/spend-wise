<?php

declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository
{
    /**
     * The model instance
     */
    protected Model $model;

    /**
     * Find a record by ID
     */
    public function findById(int $id): ?Model
    {
        return $this->model::find($id);
    }

    /**
     * Find a record by ID or fail
     */
    public function findByIdOrFail(int $id): Model
    {
        return $this->model::findOrFail($id);
    }

    /**
     * Find by column value
     */
    public function findBy(string $column, mixed $value): ?Model
    {
        return $this->model::where($column, $value)->first();
    }

    /**
     * Get all records
     */
    public function getAll(): Collection
    {
        return $this->model::all();
    }

    /**
     * Get all with relations
     */
    public function getAllWith(array $relations): Collection
    {
        return $this->model::with($relations)->get();
    }

    /**
     * Get paginated records
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model::paginate($perPage, $columns);
    }

    /**
     * Get paginated records with relations
     */
    public function paginateWith(array $relations, int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model::with($relations)->paginate($perPage, $columns);
    }

    /**
     * Count records
     */
    public function count(): int
    {
        return $this->model::count();
    }

    /**
     * Count by column value
     */
    public function countBy(string $column, mixed $value): int
    {
        return $this->model::where($column, $value)->count();
    }

    /**
     * Check if record exists
     */
    public function exists(int $id): bool
    {
        return $this->model::where('id', $id)->exists();
    }

    /**
     * Check if record exists by column
     */
    public function existsBy(string $column, mixed $value): bool
    {
        return $this->model::where($column, $value)->exists();
    }

    /**
     * Get records where column equals value
     */
    public function getWhere(string $column, mixed $value): Collection
    {
        return $this->model::where($column, $value)->get();
    }

    /**
     * Get records where column equals value with relations
     */
    public function getWhereWith(string $column, mixed $value, array $relations): Collection
    {
        return $this->model::where($column, $value)->with($relations)->get();
    }

    /**
     * Get first record where column equals value
     */
    public function firstWhere(string $column, mixed $value): ?Model
    {
        return $this->model::where($column, $value)->first();
    }

    /**
     * Get records ordered by column
     */
    public function getOrderedBy(string $column, string $direction = 'asc'): Collection
    {
        return $this->model::orderBy($column, $direction)->get();
    }

    /**
     * Get latest records
     */
    public function getLatest(int $limit = 10): Collection
    {
        return $this->model::latest()->limit($limit)->get();
    }
}
