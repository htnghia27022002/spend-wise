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
        Schema::create('calendar_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->integer('minutes_before');
            $table->enum('reminder_type', ['notification', 'email', 'sms'])->default('notification');
            $table->boolean('is_sent')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['calendar_event_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_reminders');
    }
};
