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
            if (Schema::hasColumns('notification_settings', [
                'subscription_due_enabled',
                'subscription_overdue_enabled',
                'installment_due_enabled',
                'installment_overdue_enabled',
                'days_before_due',
                'notification_method',
            ])) {
                $table->dropColumn([
                    'subscription_due_enabled',
                    'subscription_overdue_enabled',
                    'installment_due_enabled',
                    'installment_overdue_enabled',
                    'days_before_due',
                    'notification_method',
                ]);
            }
            
            // Add flexible notification preferences
            if (!Schema::hasColumn('notification_settings', 'preferences')) {
                $table->json('preferences')->nullable()->comment('JSON object for all notification type preferences');
            }
            
            // Add global notification channels
            if (!Schema::hasColumn('notification_settings', 'enabled_channels')) {
                $table->json('enabled_channels')->nullable()->comment('Array of enabled channels: database, email, sms, push');
            }
            
            // Add quiet hours
            if (!Schema::hasColumn('notification_settings', 'quiet_hours_start')) {
                $table->time('quiet_hours_start')->nullable();
            }
            if (!Schema::hasColumn('notification_settings', 'quiet_hours_end')) {
                $table->time('quiet_hours_end')->nullable();
            }
            
            // Add timezone
            if (!Schema::hasColumn('notification_settings', 'timezone')) {
                $table->string('timezone', 50)->default('UTC');
            }
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
