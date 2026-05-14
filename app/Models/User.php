<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 👈 مهم جدًا (admin, seller, buyer)
    ];

    /**
     * Hidden fields for API responses
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ======================================================
    // 🔐 ROLES HELPERS (IMPORTANT FOR RBAC)
    // ======================================================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }

    public function isBuyer(): bool
    {
        return $this->role === 'buyer';
    }

    // ======================================================
    // 📦 RELATIONSHIPS (IMPORTANT FOR MARKETPLACE)
    // ======================================================

    /**
     * Products created by seller
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    /**
     * Orders placed by buyer
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Reviews written by user
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Cart (one-to-one)
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }
}
