<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Admin can do anything.
     */
    public function before(User $user): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    /**
     * Any authenticated user can view products.
     */
    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    /**
     * Only sellers can create products.
     */
    public function create(User $user): bool
    {
        return $user->role === 'seller';
    }

    /**
     * Only the owner seller can update their product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->role === 'seller' && $user->id === $product->seller_id;
    }

    /**
     * Only the owner seller can delete their product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'seller' && $user->id === $product->seller_id;
    }
}
