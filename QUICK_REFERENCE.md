# Notification System - Quick Reference Card

## 🚀 Quick Start

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Start Queue Worker
```bash
php artisan queue:work
```

### 3. Access Pages
- Channel Settings: `/notifications/channels`
- Templates: `/notifications/templates`
- Notifications List: `/notifications`
- User Settings: `/notifications/settings`

---

## 📁 File Structure

```
app/
├── Models/Notification/
│   ├── Notification.php (enhanced)
│   ├── NotificationChannelSetting.php
│   └── NotificationTemplate.php
├── Services/Notification/
│   ├── ChannelSettingService.php
│   └── TemplateService.php
├── Repositories/Notification/
│   ├── NotificationRepository.php
│   ├── ChannelSettingRepository.php
│   └── TemplateRepository.php
├── Http/Controllers/Notification/
│   ├── NotificationController.php (enhanced)
│   ├── ChannelSettingController.php
│   └── TemplateController.php
└── Jobs/Notification/
    └── SendNotificationJob.php

database/migrations/
├── 2026_01_29_100000_create_notification_channel_settings_table.php
├── 2026_01_29_100001_create_notification_templates_table.php
└── 2026_01_29_100002_add_status_tracking_to_notifications.php

resources/js/
├── pages/Notifications/
│   ├── Index.tsx (enhanced)
│   ├── Settings.tsx (existing)
│   ├── ChannelSettings/Index.tsx
│   └── Templates/
│       ├── Index.tsx
│       ├── Create.tsx
│       └── Edit.tsx
└── types/finance.ts (enhanced)
```

---

## 🔑 Key Endpoints

### Channel Settings
```
GET    /notifications/channels           # List all
POST   /notifications/channels           # Create
PUT    /notifications/channels/{channel} # Update
POST   /notifications/channels/{channel}/test # Test
DELETE /notifications/channels/{channel} # Delete
```

### Templates
```
GET    /notifications/templates        # List all
POST   /notifications/templates        # Create
GET    /notifications/templates/{id}   # Show
PUT    /notifications/templates/{id}   # Update
DELETE /notifications/templates/{id}   # Delete
POST   /notifications/templates/{id}/preview # Preview
```

### Notifications
```
GET    /notifications                  # List (with ?status filter)
POST   /notifications/{id}/mark-as-read
POST   /notifications/{id}/retry
```

---

## 💾 Database Tables

### notification_channel_settings
- `channel` (email|sms|push)
- `configuration` (JSON)
- `is_active`
- `last_tested_at`

### notification_templates
- `type` (notification type)
- `channel` (email|sms|push|database)
- `subject` (for email)
- `body` (template content)
- `is_default`

### notifications (enhanced)
- `status` (pending|sending|sent|failed)
- `retry_count`
- `last_error`
- `template_id`

---

## 📝 Template Variables

### Common Variables
```
{{user_name}}          - User's full name
{{user_email}}         - User's email address
{{title}}              - Notification title
{{message}}            - Notification message
{{action_url}}         - Action URL/link
```

### Finance Variables
```
{{amount}}             - Monetary amount
{{due_date}}           - Due date
{{subscription_name}}  - Subscription name
{{installment_name}}   - Installment name
```

---

## 🎨 UI Components

### Channel Settings Page
**Location:** `/notifications/channels`

**Features:**
- Email (SMTP) configuration tab
- SMS configuration tab
- Push configuration tab
- Test connection button
- Save/Update functionality

### Templates Page
**Location:** `/notifications/templates`

**Features:**
- List all templates
- Create new template
- Edit existing template
- Delete template
- Variable helper guide

### Notifications Page
**Location:** `/notifications`

**Features:**
- Filter by status
- Retry failed notifications
- Mark as read
- View error messages

---

## 🔧 Configuration Examples

### Email (SMTP)
```json
{
  "host": "smtp.gmail.com",
  "port": "587",
  "encryption": "tls",
  "username": "your-email@gmail.com",
  "password": "your-app-password",
  "from_address": "noreply@spendwise.com",
  "from_name": "SpendWise"
}
```

### SMS (Twilio)
```json
{
  "provider": "twilio",
  "account_sid": "ACxxxxxxxxxxxxxxxx",
  "auth_token": "your_token",
  "from_number": "+1234567890"
}
```

### Push (FCM)
```json
{
  "provider": "fcm",
  "api_key": "your_fcm_key",
  "sender_id": "123456789012"
}
```

---

## 🧪 Testing Checklist

### Backend
- [ ] Create channel settings via API
- [ ] Test connection for each channel
- [ ] Create template via API
- [ ] Send test notification
- [ ] Verify status transitions
- [ ] Test retry mechanism

### Frontend
- [ ] Navigate to channel settings
- [ ] Fill and save SMTP config
- [ ] Test SMTP connection
- [ ] Create new template
- [ ] Edit template
- [ ] Filter notifications by status
- [ ] Retry failed notification

### Integration
- [ ] Configure email end-to-end
- [ ] Create template
- [ ] Trigger notification
- [ ] Verify email sent
- [ ] Test failure and retry

---

## 📊 Status Flow

```
CREATE NOTIFICATION
       ↓
   [pending]
       ↓
SendNotificationJob
       ↓
   [sending]
       ↓
   Success? ──YES──> [sent]
       ↓
      NO
       ↓
   [failed]
       ↓
  Retry < Max?
   ↓       ↓
  YES      NO
   ↓       ↓
[pending] END
```

---

## 🔍 Common Queries

### Get Failed Notifications
```php
Notification::where('status', 'failed')
    ->where('retry_count', '<', DB::raw('max_retries'))
    ->get();
```

### Count by Status
```php
Notification::select('status', DB::raw('count(*) as total'))
    ->groupBy('status')
    ->get();
```

### Get Notifications Due for Retry
```php
Notification::where('status', 'failed')
    ->where('retry_count', '<', DB::raw('max_retries'))
    ->where('next_retry_at', '<=', now())
    ->get();
```

---

## 🛠️ Maintenance

### Clear Old Notifications (90+ days)
```php
Notification::where('created_at', '<', now()->subDays(90))->delete();
```

### Requeue Failed Notifications
```php
$failed = Notification::where('status', 'failed')
    ->where('retry_count', '<', DB::raw('max_retries'))
    ->get();

foreach ($failed as $notification) {
    $notification->update([
        'status' => 'pending',
        'next_retry_at' => now(),
    ]);
}
```

---

## 📞 Support

**Documentation:**
- Technical Guide: `NOTIFICATION_SYSTEM_GUIDE.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Quick Reference: `QUICK_REFERENCE.md` (this file)

**Code Locations:**
- Backend: `app/**/Notification/`
- Frontend: `resources/js/pages/Notifications/`
- Migrations: `database/migrations/2026_01_29_*.php`

---

## ⚡ Performance Tips

1. **Queue Worker**: Always keep queue worker running
2. **Indexing**: Migrations include necessary indexes
3. **Cleanup**: Schedule periodic cleanup of old notifications
4. **Caching**: Channel settings are queried per send (consider caching)
5. **Batch**: Process multiple notifications in single job if needed

---

## 🎯 Quick Actions

### Send a Notification (Code)
```php
use App\Services\Notification\NotificationService;

$service = app(NotificationService::class);
$service->send(
    userId: $user->id,
    type: 'finance.subscription_due',
    title: 'Payment Due',
    message: 'Your subscription is due soon',
    data: ['amount' => 50000],
    actionUrl: '/subscriptions/123'
);
```

### Manually Retry Failed
```bash
php artisan tinker
>>> $failed = Notification::where('status', 'failed')->get();
>>> foreach($failed as $n) { $n->update(['status' => 'pending']); }
```

---

**Version:** 1.0.0  
**Last Updated:** January 28, 2026  
**Status:** Production Ready ✅
