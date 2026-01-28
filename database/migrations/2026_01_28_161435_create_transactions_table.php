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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['income', 'expense'])->default('expense');
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->date('transaction_date');
            $table->boolean('is_installment')->default(false);
            $table->foreignId('installment_payment_id')->nullable()->constrained('installment_payments')->nullOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'transaction_date']);
            $table->index(['wallet_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
