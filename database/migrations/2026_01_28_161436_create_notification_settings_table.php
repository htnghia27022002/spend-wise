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
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('subscription_due_enabled')->default(true);
            $table->boolean('subscription_overdue_enabled')->default(true);
            $table->boolean('installment_due_enabled')->default(true);
            $table->boolean('installment_overdue_enabled')->default(true);
            $table->integer('days_before_due')->default(3);
            $table->enum('notification_method', ['push', 'email', 'inapp', 'all'])->default('all');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
