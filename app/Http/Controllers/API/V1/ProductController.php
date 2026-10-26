<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(protected ProductService $productService) {}

    /**
     * GET /api/v1/products
     * Public: List all products with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'min_price', 'max_price']);
        $products = $this->productService->listProducts($filters, (int)$request->get('per_page', 15));

        return $this->successResponse(ProductResource::collection($products));
    }

    /**
     * GET /api/v1/products/{id}
     * Public: Show single product.
     */
    public function show(int $id): JsonResponse
    {
        $product = $this->productService->showProduct($id);

        if ($product->is_archived) {
            abort(404);
        }

        return $this->successResponse(new ProductResource($product));
    }

    /**
     * POST /api/v1/seller/products
     * Seller only: Create product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\Product::class);

        $product = $this->productService->createProduct(
            $request->validated(),
            $request->user()
        );

        return $this->successResponse(new ProductResource($product), 'Product created.', 201);
    }

    /**
     * PUT /api/v1/seller/products/{id}
     * Seller only (owner): Update product.
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $this->productService->updateProduct($id, $request->validated(), $request->user());
        return $this->successResponse(new ProductResource($product), 'Product updated.');
    }

    /**
     * DELETE /api/v1/seller/products/{id}
     * Seller only (owner): Soft-delete product.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $this->productService->deleteProduct($id, $request->user());
        return $this->successResponse(null, 'Product deleted.');
    }

    /**
     * GET /api/v1/seller/products
     * Seller: Get their own products.
     */
    public function myProducts(Request $request): JsonResponse
    {
        $products = $this->productService->getSellerProducts($request->user());
        return $this->successResponse(ProductResource::collection($products));
    }
}
