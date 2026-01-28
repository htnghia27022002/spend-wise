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
            // Add status tracking
            $table->enum('status', ['pending', 'sending', 'sent', 'failed'])->default('pending')->after('sent_at');
            $table->integer('retry_count')->default(0)->after('status');
            $table->integer('max_retries')->default(3)->after('retry_count');
            $table->text('last_error')->nullable()->after('max_retries');
            $table->timestamp('next_retry_at')->nullable()->after('last_error');
            
            // Add template reference
            $table->foreignId('template_id')->nullable()->after('channel')->constrained('notification_templates')->nullOnDelete();
            
            $table->index('status');
            $table->index('next_retry_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn([
                'status',
                'retry_count',
                'max_retries',
                'last_error',
                'next_retry_at',
                'template_id',
            ]);
        });
    }
};
