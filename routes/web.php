<?php

use App\Http\Controllers\Calendar\CalendarController;
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

    // Calendar
    Route::resource('calendar', CalendarController::class)->names([
        'index' => 'calendar.index',
        'create' => 'calendar.create',
        'store' => 'calendar.store',
        'show' => 'calendar.show',
        'edit' => 'calendar.edit',
        'update' => 'calendar.update',
        'destroy' => 'calendar.destroy',
    ]);
    Route::get('calendar/overview', [CalendarController::class, 'overview'])->name('calendar.overview');

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
