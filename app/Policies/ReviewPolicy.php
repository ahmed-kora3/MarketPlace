<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function before(User $user): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    /**
     * Only buyers can create reviews.
     */
    public function create(User $user): bool
    {
        return $user->role === 'buyer';
    }

    /**
     * Only the review author can delete it.
     */
    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->buyer_id;
    }
}
