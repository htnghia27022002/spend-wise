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
        Schema::create('notification_channel_settings', function (Blueprint $table) {
            $table->id();
            $table->string('channel')->unique(); // email, sms, push
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->json('configuration'); // Channel-specific settings
            $table->timestamp('last_tested_at')->nullable();
            $table->boolean('test_successful')->nullable();
            $table->text('test_error')->nullable();
            $table->timestamps();

            $table->index('channel');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_channel_settings');
    }
};
