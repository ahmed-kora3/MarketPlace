<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@marketplace.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Create Sellers
        $seller1 = User::create([
            'name'     => 'Ahmed Seller',
            'email'    => 'seller@marketplace.com',
            'password' => Hash::make('password'),
            'role'     => 'seller',
        ]);

        $seller2 = User::create([
            'name'     => 'Sara Crafts',
            'email'    => 'sara@marketplace.com',
            'password' => Hash::make('password'),
            'role'     => 'seller',
        ]);

        // Create Buyer
        User::create([
            'name'     => 'Mohamed Buyer',
            'email'    => 'buyer@marketplace.com',
            'password' => Hash::make('password'),
            'role'     => 'buyer',
        ]);

        // Create Categories
        $categories = [
            ['name' => 'Jewelry',     'description' => 'Handmade rings, bracelets, and necklaces'],
            ['name' => 'Pottery',     'description' => 'Clay pots and ceramic art'],
            ['name' => 'Paintings',   'description' => 'Original hand-painted artwork'],
            ['name' => 'Textiles',    'description' => 'Handwoven fabrics and clothing'],
            ['name' => 'Woodwork',    'description' => 'Custom wooden items and furniture'],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name'        => $cat['name'],
                'slug'        => Str::slug($cat['name']),
                'description' => $cat['description'],
            ]);
        }

        // Create Products for Seller 1
        $jewelry = Category::where('name', 'Jewelry')->first();
        $pottery = Category::where('name', 'Pottery')->first();
        $paintings = Category::where('name', 'Paintings')->first();

        $products = [
            [
                'seller_id'   => $seller1->id,
                'category_id' => $jewelry->id,
                'name'        => 'Silver Handmade Ring',
                'price'       => 49.99,
                'stock'       => 20,
                'description' => 'Beautiful handcrafted silver ring with engraved patterns.',
            ],
            [
                'seller_id'   => $seller1->id,
                'category_id' => $jewelry->id,
                'name'        => 'Gold Beaded Bracelet',
                'price'       => 79.99,
                'stock'       => 15,
                'description' => 'Elegant gold-colored beaded bracelet, handmade.',
            ],
            [
                'seller_id'   => $seller1->id,
                'category_id' => $pottery->id,
                'name'        => 'Ceramic Coffee Mug',
                'price'       => 24.99,
                'stock'       => 50,
                'description' => 'Hand-thrown ceramic mug, microwave safe.',
            ],
            [
                'seller_id'   => $seller2->id,
                'category_id' => $paintings->id,
                'name'        => 'Abstract Canvas Painting',
                'price'       => 149.99,
                'stock'       => 5,
                'description' => 'Original abstract painting on canvas, one of a kind.',
            ],
            [
                'seller_id'   => $seller2->id,
                'category_id' => $pottery->id,
                'name'        => 'Decorative Clay Vase',
                'price'       => 59.99,
                'stock'       => 10,
                'description' => 'Hand-sculpted decorative clay vase with geometric patterns.',
            ],
        ];

        foreach ($products as $productData) {
            Product::create([
                ...$productData,
                'slug' => Str::slug($productData['name']) . '-' . Str::random(5),
            ]);
        }
    }
}
