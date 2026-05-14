<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Versioned /api/v1/
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // =============================================
    // PUBLIC ROUTES (No auth required)
    // =============================================

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });

    // Public Product & Category Browsing
    Route::get('/products',                            [ProductController::class, 'index']);
    Route::get('/products/{id}',                       [ProductController::class, 'show']);
    Route::get('/products/{productId}/reviews',        [ReviewController::class, 'index']);
    Route::get('/categories',                          [CategoryController::class, 'index']);
    Route::get('/categories/{category}',               [CategoryController::class, 'show']);

    // =============================================
    // PROTECTED ROUTES (Sanctum auth required)
    // =============================================

    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);

        // ==================
        // SELLER ROUTES
        // ==================
        Route::middleware('role:seller')->prefix('seller')->group(function () {
            Route::get('/products',        [ProductController::class, 'myProducts']);
            Route::post('/products',       [ProductController::class, 'store']);
            Route::put('/products/{id}',   [ProductController::class, 'update']);
            Route::delete('/products/{id}',[ProductController::class, 'destroy']);
        });

        // ==================
        // BUYER ROUTES
        // ==================
        Route::middleware('role:buyer')->prefix('buyer')->group(function () {
            // Cart
            Route::get('/cart',                    [CartController::class, 'index']);
            Route::post('/cart',                   [CartController::class, 'addItem']);
            Route::put('/cart/{cartItemId}',       [CartController::class, 'updateItem']);
            Route::delete('/cart/{cartItemId}',    [CartController::class, 'removeItem']);

            // Orders
            Route::post('/orders/checkout',        [OrderController::class, 'checkout']);
            Route::get('/orders',                  [OrderController::class, 'index']);
            Route::get('/orders/{id}',             [OrderController::class, 'show']);

            // Reviews (buyers review products)
            Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);
        });

        // ==================
        // ADMIN ROUTES
        // ==================
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard',                              [AdminDashboardController::class, 'stats']);
            Route::get('/orders',                                 [AdminDashboardController::class, 'orders']);
            Route::patch('/orders/{id}/status',                   [AdminDashboardController::class, 'updateOrderStatus']);
            Route::post('/orders/{id}/confirm-payment',           [AdminDashboardController::class, 'confirmPayment']);
            Route::post('/orders/{id}/flag-payment',              [AdminDashboardController::class, 'flagPaymentFailed']);
            Route::post('/categories',                            [CategoryController::class, 'store']);
        });
    });
});
