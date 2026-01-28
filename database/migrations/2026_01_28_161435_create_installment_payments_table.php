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
        Schema::create('installment_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installment_id')->constrained()->cascadeOnDelete();
            $table->integer('payment_number');
            $table->decimal('amount', 15, 2);
            $table->date('due_date');
            $table->enum('status', ['unpaid', 'paid', 'overdue'])->default('unpaid');
            $table->date('paid_date')->nullable();
            $table->decimal('paid_amount', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['installment_id', 'status']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_payments');
    }
};
