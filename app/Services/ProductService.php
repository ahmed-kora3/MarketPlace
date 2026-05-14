<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function listProducts(array $filters, int $perPage = 15)
    {
        return $this->productRepository->getAllActive($filters, $perPage);
    }

    public function showProduct(int $id)
    {
        return $this->productRepository->findById($id);
    }

    public function createProduct(array $data, User $seller)
    {
        $data['seller_id'] = $seller->id;
        return $this->productRepository->create($data);
    }

    public function updateProduct(int $id, array $data, User $user)
    {
        $product = $this->productRepository->findById($id);

        if ($user->cannot('update', $product)) {
            throw new HttpException(403, 'You do not own this product.');
        }

        return $this->productRepository->update($id, $data);
    }

    public function deleteProduct(int $id, User $user): bool
    {
        $product = $this->productRepository->findById($id);

        if ($user->cannot('delete', $product)) {
            throw new HttpException(403, 'You do not own this product.');
        }

        return $this->productRepository->delete($id);
    }

    public function getSellerProducts(User $seller, int $perPage = 15)
    {
        return $this->productRepository->getSellerProducts($seller->id, $perPage);
    }
}
