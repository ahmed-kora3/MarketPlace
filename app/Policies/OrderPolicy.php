<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function before(User $user): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    /**
     * Only buyers can create orders.
     */
    public function create(User $user): bool
    {
        return $user->role === 'buyer';
    }

    /**
     * Buyers can only view their own orders.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->buyer_id;
    }
}
