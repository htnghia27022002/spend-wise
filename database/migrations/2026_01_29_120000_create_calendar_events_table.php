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
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->enum('type', ['payment_due', 'subscription_due', 'installment_due', 'custom', 'reminder'])->default('custom');
            $table->enum('color', ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray'])->default('blue');
            $table->boolean('is_all_day')->default(false);
            $table->string('location')->nullable();
            $table->json('metadata')->nullable()->comment('Additional event data (linkedId, linkedType, etc)');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['user_id', 'start_date']);
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
