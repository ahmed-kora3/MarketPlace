<?php

namespace App\Repositories\Interfaces;

interface ProductRepositoryInterface
{
    public function getAllActive(array $filters, int $perPage = 15);
    public function getSellerProducts(int $sellerId, int $perPage = 15);
    public function findById(int $id);
    public function findBySlug(string $slug);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id): bool;
    public function getBySlug(string $slug);
}
