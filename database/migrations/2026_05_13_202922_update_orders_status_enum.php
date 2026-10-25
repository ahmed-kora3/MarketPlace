<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

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
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ) DEFAULT 'pending'");
    }
};
