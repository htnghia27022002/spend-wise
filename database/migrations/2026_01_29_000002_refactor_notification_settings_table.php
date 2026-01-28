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
        Schema::table('notification_settings', function (Blueprint $table) {
            // Remove Finance-specific columns
            $table->dropColumn([
                'subscription_due_enabled',
                'subscription_overdue_enabled',
                'installment_due_enabled',
                'installment_overdue_enabled',
                'days_before_due',
                'notification_method',
            ]);
            
            // Add flexible notification preferences
            $table->json('preferences')->nullable()->comment('JSON object for all notification type preferences');
            
            // Add global notification channels
            $table->json('enabled_channels')->default('["database"]')->comment('Array of enabled channels: database, email, sms, push');
            
            // Add quiet hours
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            
            // Add timezone
            $table->string('timezone', 50)->default('UTC');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notification_settings', function (Blueprint $table) {
            $table->dropColumn(['preferences', 'enabled_channels', 'quiet_hours_start', 'quiet_hours_end', 'timezone']);
            
            // Restore old columns
            $table->boolean('subscription_due_enabled')->default(true);
            $table->boolean('subscription_overdue_enabled')->default(true);
            $table->boolean('installment_due_enabled')->default(true);
            $table->boolean('installment_overdue_enabled')->default(true);
            $table->integer('days_before_due')->default(3);
            $table->enum('notification_method', ['push', 'email', 'inapp', 'all'])->default('all');
        });
    }
};
