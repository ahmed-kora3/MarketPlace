<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProductDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_product_details_return_the_product_resource(): void
    {
        $product = $this->createProduct();

        $this->getJson("/api/v1/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('status', 'Success')
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.is_archived', false);
    }

    public function test_archived_products_are_not_available_from_public_details(): void
    {
        $product = $this->createProduct(isArchived: true);

        $this->getJson("/api/v1/products/{$product->id}")
            ->assertNotFound()
            ->assertJsonPath('status', 'Error')
            ->assertJsonPath('data', null);
    }

    private function createProduct(bool $isArchived = false): Product
    {
        $seller = User::create([
            'name' => 'Test Seller',
            'email' => 'seller@example.test',
            'password' => 'password',
            'role' => 'seller',
        ]);

        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        return Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'A product used by the API feature test.',
            'price' => 12.50,
            'stock' => 3,
            'is_archived' => $isArchived,
        ]);
    }
}
