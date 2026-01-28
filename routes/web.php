<?php

use App\Http\Controllers\Finance\CategoryController;
use App\Http\Controllers\Finance\DashboardController;
use App\Http\Controllers\Finance\InstallmentController;
use App\Http\Controllers\Finance\NotificationController;
use App\Http\Controllers\Finance\SubscriptionController;
use App\Http\Controllers\Finance\TransactionController;
use App\Http\Controllers\Finance\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('tools/encoder-decoder', [\App\Http\Controllers\Tools\EncoderDecoderController::class, 'show'])
        ->name('tools.encoder-decoder.show');
    Route::post('tools/encoder-decoder/encode', [\App\Http\Controllers\Tools\EncoderDecoderController::class, 'encode'])
        ->name('tools.encoder-decoder.encode');
    Route::post('tools/encoder-decoder/decode', [\App\Http\Controllers\Tools\EncoderDecoderController::class, 'decode'])
        ->name('tools.encoder-decoder.decode');

    // Finance routes
    Route::get('finance/dashboard', [DashboardController::class, 'index'])->name('finance.dashboard');

    // Wallets
    Route::resource('wallets', WalletController::class)->names([
        'index' => 'wallets.index',
        'create' => 'wallets.create',
        'store' => 'wallets.store',
        'show' => 'wallets.show',
        'edit' => 'wallets.edit',
        'update' => 'wallets.update',
        'destroy' => 'wallets.destroy',
    ]);

    // Categories
    Route::resource('categories', CategoryController::class)->names([
        'index' => 'categories.index',
        'create' => 'categories.create',
        'store' => 'categories.store',
        'edit' => 'categories.edit',
        'update' => 'categories.update',
        'destroy' => 'categories.destroy',
    ]);
    Route::post('categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

    // Transactions
    Route::resource('transactions', TransactionController::class)->names([
        'index' => 'transactions.index',
        'create' => 'transactions.create',
        'store' => 'transactions.store',
        'edit' => 'transactions.edit',
        'update' => 'transactions.update',
        'destroy' => 'transactions.destroy',
    ]);
    Route::post('transactions/bulk-delete', [TransactionController::class, 'bulkDelete'])->name('transactions.bulkDelete');

    // Subscriptions
    Route::resource('subscriptions', SubscriptionController::class)->names([
        'index' => 'subscriptions.index',
        'create' => 'subscriptions.create',
        'store' => 'subscriptions.store',
        'edit' => 'subscriptions.edit',
        'update' => 'subscriptions.update',
        'destroy' => 'subscriptions.destroy',
    ]);
    Route::post('subscriptions/{id}/pause', [SubscriptionController::class, 'pause'])->name('subscriptions.pause');
    Route::post('subscriptions/{id}/resume', [SubscriptionController::class, 'resume'])->name('subscriptions.resume');

    // Installments
    Route::resource('installments', InstallmentController::class)->names([
        'index' => 'installments.index',
        'create' => 'installments.create',
        'store' => 'installments.store',
        'show' => 'installments.show',
        'edit' => 'installments.edit',
        'update' => 'installments.update',
        'destroy' => 'installments.destroy',
    ]);
    Route::post('installments/{id}/pause', [InstallmentController::class, 'pause'])->name('installments.pause');
    Route::post('installments/{id}/resume', [InstallmentController::class, 'resume'])->name('installments.resume');
    Route::post('installments/{id}/mark-payment-paid', [InstallmentController::class, 'markPaymentPaid'])->name('installments.markPaymentPaid');

    // Notifications - moved to independent Notification module
    Route::get('notifications', [\App\Http\Controllers\Notification\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread', [\App\Http\Controllers\Notification\NotificationController::class, 'getUnread'])->name('notifications.unread');
    Route::post('notifications/{id}/mark-as-read', [\App\Http\Controllers\Notification\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('notifications/mark-all-as-read', [\App\Http\Controllers\Notification\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::post('notifications/{id}/retry', [\App\Http\Controllers\Notification\NotificationController::class, 'retry'])->name('notifications.retry');
    
    // Notification Settings
    Route::get('notifications/settings', [\App\Http\Controllers\Notification\NotificationController::class, 'settings'])->name('notifications.settings');
    Route::get('notifications/settings/data', [\App\Http\Controllers\Notification\NotificationController::class, 'getSettings'])->name('notifications.settings.data');
    Route::post('notifications/settings', [\App\Http\Controllers\Notification\NotificationController::class, 'updateSettings'])->name('notifications.updateSettings');

    // Channel Settings
    Route::get('notifications/channels', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'index'])->name('notifications.channels.index');
    Route::post('notifications/channels', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'store'])->name('notifications.channels.store');
    Route::put('notifications/channels/{channel}', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'update'])->name('notifications.channels.update');
    Route::delete('notifications/channels/{channel}', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'destroy'])->name('notifications.channels.destroy');
    Route::post('notifications/channels/{channel}/test', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'test'])->name('notifications.channels.test');
    Route::post('notifications/channels/{channel}/activate', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'activate'])->name('notifications.channels.activate');
    Route::post('notifications/channels/{channel}/deactivate', [\App\Http\Controllers\Notification\ChannelSettingController::class, 'deactivate'])->name('notifications.channels.deactivate');

    // Templates
    Route::get('notifications/templates', [\App\Http\Controllers\Notification\TemplateController::class, 'index'])->name('notifications.templates.index');
    Route::get('notifications/templates/create', [\App\Http\Controllers\Notification\TemplateController::class, 'create'])->name('notifications.templates.create');
    Route::post('notifications/templates', [\App\Http\Controllers\Notification\TemplateController::class, 'store'])->name('notifications.templates.store');
    Route::get('notifications/templates/{id}', [\App\Http\Controllers\Notification\TemplateController::class, 'show'])->name('notifications.templates.show');
    Route::get('notifications/templates/{id}/edit', [\App\Http\Controllers\Notification\TemplateController::class, 'edit'])->name('notifications.templates.edit');
    Route::put('notifications/templates/{id}', [\App\Http\Controllers\Notification\TemplateController::class, 'update'])->name('notifications.templates.update');
    Route::delete('notifications/templates/{id}', [\App\Http\Controllers\Notification\TemplateController::class, 'destroy'])->name('notifications.templates.destroy');
    Route::post('notifications/templates/{id}/preview', [\App\Http\Controllers\Notification\TemplateController::class, 'preview'])->name('notifications.templates.preview');
});

require __DIR__.'/settings.php';
