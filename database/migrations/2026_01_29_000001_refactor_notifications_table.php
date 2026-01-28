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
        Schema::table('notifications', function (Blueprint $table) {
            // Change type from enum to string for flexibility
            $table->string('type', 100)->change();
            
            // Add channel support (email, sms, push, database, etc.)
            $table->string('channel', 50)->default('database')->after('type');
            
            // Add metadata for extensibility
            $table->json('data')->nullable()->after('message');
            
            // Add action URL
            $table->string('action_url')->nullable()->after('data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['channel', 'data', 'action_url']);
            // Note: Reverting enum is complex, keep as string
        });
    }
};
