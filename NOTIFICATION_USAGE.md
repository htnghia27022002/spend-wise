# Notification System - Usage Guide

## Overview

Hệ thống Notification đã được refactor thành module độc lập, flexible và có thể tái sử dụng cho bất kỳ chức năng nào trong ứng dụng.

## Architecture Changes

### 1. Database Schema

**Notifications Table:**
- `type`: String (thay vì enum) - flexible cho mọi loại notification
- `channel`: String - kênh gửi (database, email, sms, push)
- `data`: JSON - metadata bổ sung
- `action_url`: URL cho action button

**Notification Settings Table:**
- `preferences`: JSON - object chứa preferences cho từng notification type
- `enabled_channels`: JSON array - các kênh được bật
- `quiet_hours_start/end`: Time - giờ im lặng
- `timezone`: String - timezone của user

### 2. Notification Type Registry

**File:** `app/Services/Notification/NotificationTypeRegistry.php`

Registry tập trung quản lý tất cả notification types trong app. Mọi module có thể đăng ký notification types của mình.

**Đăng ký notification type:**
```php
// File: app/Providers/NotificationServiceProvider.php

NotificationTypeRegistry::register('module.type_name', [
    'name' => 'Human Readable Name',
    'description' => 'Description of this notification',
    'channels' => ['database', 'email', 'sms'],
    'default_enabled' => true,
    'configurable' => true, // User có thể tắt/bật?
]);
```

**Ví dụ Finance Module:**
```php
NotificationTypeRegistry::register('finance.subscription_due', [
    'name' => 'Subscription Due',
    'description' => 'Notification when a subscription payment is coming due',
    'channels' => ['database', 'email'],
    'default_enabled' => true,
    'configurable' => true,
]);
```

### 3. Sending Notifications

**Old way (deprecated):**
```php
Notification::create([
    'user_id' => $userId,
    'type' => 'subscription_due',
    'title' => 'Title',
    'message' => 'Message',
]);
```

**New way (recommended):**
```php
use App\Contracts\Notification\NotificationServiceInterface;

class YourService {
    public function __construct(
        private NotificationServiceInterface $notificationService
    ) {}
    
    public function doSomething() {
        $this->notificationService->send(
            userId: $user->id,
            type: 'finance.subscription_due', // Must be registered
            title: 'Your subscription is due',
            message: 'Payment needed for Premium Plan',
            data: [
                'subscription_id' => $subscription->id,
                'amount' => 99.99,
            ],
            notifiable: $subscription, // Related model
            actionUrl: route('subscriptions.show', $subscription->id)
        );
    }
}
```

## Adding New Notification Types

### Step 1: Register Notification Type

```php
// app/Providers/NotificationServiceProvider.php

NotificationTypeRegistry::register('orders.order_shipped', [
    'name' => 'Order Shipped',
    'description' => 'Notification when your order has been shipped',
    'channels' => ['database', 'email', 'push'],
    'default_enabled' => true,
    'configurable' => true,
]);
```

### Step 2: Send Notification

```php
// app/Services/Order/OrderService.php

public function markAsShipped(Order $order): void
{
    // ... business logic
    
    $this->notificationService->send(
        userId: $order->user_id,
        type: 'orders.order_shipped',
        title: "Your order #{$order->number} has been shipped",
        message: "Tracking number: {$order->tracking_number}",
        data: [
            'order_id' => $order->id,
            'tracking_number' => $order->tracking_number,
        ],
        notifiable: $order,
        actionUrl: route('orders.track', $order->id)
    );
}
```

### Step 3: User Preferences

Users can enable/disable notification types in Settings page (`/notifications/settings`). The system automatically respects these preferences.

## Frontend Usage

### Display Notifications

```tsx
// pages/Notifications/Index.tsx - Already created
import { NotificationItem } from '@/components/Notification';

<NotificationItem 
  notification={notif} 
  onMarkAsRead={() => markAsRead(notif.id)} 
/>
```

### Settings Page

```tsx
// pages/Notifications/Settings.tsx - Already created
// Users can:
// - Enable/disable channels (database, email, sms, push)
// - Enable/disable specific notification types
// - Set quiet hours
// - Configure timezone
```

## Controller Structure

**New Location:** `app/Http/Controllers/Notification/NotificationController.php`

**Routes:**
- `GET /notifications` - List notifications
- `GET /notifications/unread` - Get unread count
- `POST /notifications/{id}/mark-as-read` - Mark as read
- `POST /notifications/mark-all-as-read` - Mark all as read
- `GET /notifications/settings` - Settings page
- `GET /notifications/settings/data` - Get settings data (API)
- `POST /notifications/settings` - Update settings

## Benefits

✅ **Flexible:** Không bị giới hạn bởi enum, có thể thêm notification type mới dễ dàng
✅ **Modular:** Mỗi module tự đăng ký notification types của mình
✅ **User Control:** User có thể tùy chỉnh preferences cho từng loại notification
✅ **Multi-Channel:** Hỗ trợ nhiều kênh (database, email, sms, push)
✅ **Extensible:** Dễ dàng mở rộng với metadata JSON và action URLs
✅ **Reusable:** Có thể dùng cho bất kỳ feature nào (Finance, Orders, Users, etc.)

## Migration Notes

**Old Finance-specific fields removed:**
- `subscription_due_enabled`
- `subscription_overdue_enabled`
- `installment_due_enabled`
- `installment_overdue_enabled`
- `days_before_due`
- `notification_method`

**New flexible fields:**
- `preferences` (JSON) - contains all notification type preferences
- `enabled_channels` (JSON array)
- `quiet_hours_start/end`
- `timezone`

## Example Use Cases

### 1. Order Notifications
```php
NotificationTypeRegistry::register('orders.new_order', [...]);
NotificationTypeRegistry::register('orders.order_shipped', [...]);
NotificationTypeRegistry::register('orders.order_delivered', [...]);
```

### 2. User Notifications
```php
NotificationTypeRegistry::register('user.welcome', [...]);
NotificationTypeRegistry::register('user.password_changed', [...]);
NotificationTypeRegistry::register('user.login_suspicious', [...]);
```

### 3. System Notifications
```php
NotificationTypeRegistry::register('system.maintenance', [...]);
NotificationTypeRegistry::register('system.security_alert', [...]);
```

## Best Practices

1. **Naming Convention:** Use `module.action` format (e.g., `finance.subscription_due`)
2. **Always Register:** Register notification types in `NotificationServiceProvider`
3. **Use Service:** Always send via `NotificationServiceInterface->send()`
4. **Provide Context:** Include relevant data and action URLs
5. **Respect Preferences:** System automatically checks user preferences
6. **Add Metadata:** Use `data` field for additional context
