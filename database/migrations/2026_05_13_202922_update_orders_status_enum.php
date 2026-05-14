<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires ALTER TABLE to modify ENUM values
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'paid',
            'payment_failed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ) DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ) DEFAULT 'pending'");
    }
};
