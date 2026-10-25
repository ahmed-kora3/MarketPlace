<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('buyer_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->decimal('total_amount', 10, 2);

            $table->enum('status', [
                'pending',
                'paid',
                'payment_failed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
