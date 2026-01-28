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
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('total_amount', 15, 2);
            $table->integer('total_installments');
            $table->decimal('amount_per_installment', 15, 2);
            $table->date('start_date');
            $table->integer('due_day')->nullable();
            $table->enum('status', ['active', 'paused', 'completed'])->default('active');
            $table->text('description')->nullable();
            $table->date('next_due_date')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
