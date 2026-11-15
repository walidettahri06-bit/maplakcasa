<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique()->nullable();
            $table->string('customer_name');
            $table->string('customer_phone', 24)->index();
            $table->string('customer_email')->nullable();
            $table->string('plate_serial', 5)->nullable();
            $table->string('plate_letter', 8)->nullable();
            $table->unsignedTinyInteger('plate_region')->nullable();
            $table->string('status', 32)->default('pending')->index();
            $table->string('payment_method', 32);
            $table->char('currency', 3)->default('MAD');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('locale', 2)->default('fr');
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
