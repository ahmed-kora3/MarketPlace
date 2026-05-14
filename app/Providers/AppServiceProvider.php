<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Review;
use App\Models\Order;
use App\Policies\ProductPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\OrderPolicy;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\ProductRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     * This is where we bind interfaces to their implementations.
     * This is the "D" in SOLID (Dependency Inversion Principle).
     */
    public function register(): void
    {
        // Bind the Interface to the concrete Implementation.
        // Now when any class type-hints ProductRepositoryInterface,
        // Laravel will inject ProductRepository automatically.
        $this->app->bind(
            ProductRepositoryInterface::class,
            ProductRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Policies (RBAC)
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
