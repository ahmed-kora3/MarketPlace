<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Str;

class ProductRepository implements ProductRepositoryInterface
{
    public function __construct(protected Product $model) {}

    public function getAllActive(array $filters, int $perPage = 15)
    {
        $query = $this->model->query()
            ->with(['seller', 'category'])
            ->withCount('reviews')
            ->where('is_archived', false);

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get ALL products for a specific seller (including archived)
     * Used in Seller Dashboard.
     */
    public function getSellerProducts(int $sellerId, int $perPage = 15)
    {
        return $this->model->query()
            ->with(['category'])
            ->withCount('reviews')
            ->where('seller_id', $sellerId)
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id)
    {
        return $this->model->with(['seller', 'category', 'reviews.buyer'])->findOrFail($id);
    }

    public function findBySlug(string $slug)
    {
        return $this->model->with(['seller', 'category', 'reviews.buyer'])
            ->where('slug', $slug)->firstOrFail();
    }

    public function getBySlug(string $slug)
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function create(array $data)
    {
        $data['slug'] = $this->generateUniqueSlug($data['name']);
        return $this->model->create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = $this->model->findOrFail($id);
        if (isset($data['name'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $id);
        }
        $product->update($data);
        return $product->fresh(['seller', 'category']);
    }

    public function delete(int $id): bool
    {
        $product = $this->model->findOrFail($id);
        return $product->delete();
    }

    private function generateUniqueSlug(string $name, int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $query = $this->model->where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        if ($query->exists()) {
            $slug = $slug . '-' . time();
        }
        return $slug;
    }
}
