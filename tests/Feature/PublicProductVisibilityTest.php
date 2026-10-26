<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\ProductService;
use Tests\TestCase;

class PublicProductVisibilityTest extends TestCase
{
    public function test_archived_products_are_not_available_on_the_public_detail_endpoint(): void
    {
        $product = new Product(['is_archived' => true]);

        $this->mock(ProductService::class)
            ->shouldReceive('showProduct')
            ->once()
            ->with(123)
            ->andReturn($product);

        $this->getJson('/api/v1/products/123')->assertNotFound();
    }
}
