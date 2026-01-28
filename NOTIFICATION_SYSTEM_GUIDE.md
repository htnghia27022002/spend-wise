# Notification System Enhancement - Implementation Guide

## Overview

This document describes the comprehensive notification system enhancement implemented for the SpendWise application. The system now supports multiple notification channels (Email, SMS, Push, Database), template management, status tracking, and automatic retry mechanisms.

## Features Implemented

### 1. Channel Settings Management
- **Email (SMTP)**: Full SMTP configuration with host, port, encryption, credentials
- **SMS**: Provider-based configuration (Twilio, Nexmo, AWS SNS)
- **Push Notifications**: Firebase Cloud Messaging, APNS, OneSignal support
- **Connection Testing**: Test functionality for each channel before activation
- **Status Tracking**: Last tested date, success/failure status, error messages

### 2. Notification Templates
- **Template Management**: Create, edit, delete templates for each notification type
- **Channel-Specific**: Separate templates for email, SMS, push, and database notifications
- **Variable System**: Use `{{variable_name}}` placeholders in templates
- **Default Templates**: Set default templates for each notification type/channel combination
- **Preview/Test**: Preview templates with sample data before use

### 3. Enhanced Notification Tracking
- **Status States**: pending → sending → sent/failed
- **Retry Mechanism**: Automatic retry with exponential backoff (5min, 15min, 30min)
- **Error Logging**: Detailed error messages for failed notifications
- **Retry Limits**: Configurable max retries per notification
- **Status Filtering**: Filter notifications by status in the UI

### 4. Background Processing
- **Job Queue**: SendNotificationJob for async processing
- **Multi-Channel**: Automatically sends to configured channels
- **Template Rendering**: Applies templates when available
- **Error Handling**: Graceful failure handling with retry scheduling

## Database Schema

### notification_channel_settings
```sql
- id: bigint (primary key)
- channel: string (email, sms, push) - unique
- name: string
- description: text (nullable)
- is_active: boolean
- configuration: json (channel-specific config)
- last_tested_at: timestamp (nullable)
- test_successful: boolean (nullable)
- test_error: text (nullable)
- timestamps
```

### notification_templates
```sql
- id: bigint (primary key)
- name: string
- type: string (notification type from registry)
- channel: string (email, sms, push, database)
- subject: string (nullable, for email)
- body: text
- variables: json (nullable)
- is_active: boolean
- is_default: boolean
- timestamps
```

### notifications (enhanced)
```sql
- id: bigint (primary key)
- user_id: bigint (foreign key)
- type: string
- channel: string
- template_id: bigint (foreign key, nullable)
- title: string
- message: text
- data: json (nullable)
- action_url: string (nullable)
- notifiable_type: string
- notifiable_id: bigint
- read_at: datetime (nullable)
- sent: boolean
- sent_at: timestamp (nullable)
- status: enum (pending, sending, sent, failed)
- retry_count: integer
- max_retries: integer
- last_error: text (nullable)
- next_retry_at: timestamp (nullable)
- timestamps
```

## API Endpoints

### Channel Settings
- `GET /notifications/channels` - List all channel settings
- `POST /notifications/channels` - Create channel setting
- `PUT /notifications/channels/{channel}` - Update channel setting
- `DELETE /notifications/channels/{channel}` - Delete channel setting
- `POST /notifications/channels/{channel}/test` - Test connection
- `POST /notifications/channels/{channel}/activate` - Activate channel
- `POST /notifications/channels/{channel}/deactivate` - Deactivate channel

### Templates
- `GET /notifications/templates` - List all templates (paginated)
- `GET /notifications/templates/create` - Show create form
- `POST /notifications/templates` - Create template
- `GET /notifications/templates/{id}` - Show template
- `GET /notifications/templates/{id}/edit` - Show edit form
- `PUT /notifications/templates/{id}` - Update template
- `DELETE /notifications/templates/{id}` - Delete template
- `POST /notifications/templates/{id}/preview` - Preview with sample data

### Notifications
- `GET /notifications` - List notifications (with status filtering)
- `GET /notifications/unread` - Get unread notifications
- `POST /notifications/{id}/mark-as-read` - Mark as read
- `POST /notifications/mark-all-as-read` - Mark all as read
- `POST /notifications/{id}/retry` - Retry failed notification

## Frontend Pages

### Channel Settings (`/notifications/channels`)
- Tab-based interface for Email, SMS, Push configuration
- Form fields specific to each channel type
- Test connection button with real-time feedback
- Activation toggle for each channel

### Templates (`/notifications/templates`)
- **Index**: List all templates with filtering
- **Create**: Form to create new template with variable helpers
- **Edit**: Form to edit existing template
- Features:
  - Variable placeholder hints
  - Channel-specific fields (e.g., subject for email)
  - Active/Default toggles
  - Type and channel selection

### Notifications (`/notifications`)
- Enhanced list view with:
  - Status badges (pending, sending, sent, failed)
  - Status filtering dropdown
  - Retry button for failed notifications
  - Error message display
  - Retry count display
  - Read/Unread indicators

## Configuration Examples

### SMTP Email Configuration
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

### SMS Configuration (Twilio)
```json
{
  "provider": "twilio",
  "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "auth_token": "your_auth_token",
  "from_number": "+1234567890"
}
```

### Push Notification Configuration (FCM)
```json
{
  "provider": "fcm",
  "api_key": "your_fcm_api_key",
  "sender_id": "123456789012"
}
```

## Template Variables

Common variables available in templates:
- `{{user_name}}` - User's name
- `{{user_email}}` - User's email
- `{{title}}` - Notification title
- `{{message}}` - Notification message
- `{{action_url}}` - Action URL
- `{{amount}}` - Amount (for finance notifications)
- `{{due_date}}` - Due date
- `{{subscription_name}}` - Subscription name
- `{{installment_name}}` - Installment name

### Example Email Template
```
Subject: {{subscription_name}} Payment Due

Hello {{user_name}},

This is a reminder that your subscription "{{subscription_name}}" 
has a payment due on {{due_date}}.

Amount due: {{amount}} VND

Please ensure payment is made on time to avoid service interruption.

Thank you!
SpendWise Team
```

## Usage Guide

### 1. Configure Email Channel
1. Navigate to **Notifications → Channel Settings**
2. Select the **Email (SMTP)** tab
3. Fill in your SMTP details:
   - Host, Port, Encryption
   - Username, Password
   - From Address and Name
4. Click **Test Connection** to verify settings
5. Enable the channel if test is successful
6. Click **Save Configuration**

### 2. Create a Template
1. Navigate to **Notifications → Templates**
2. Click **Create Template**
3. Fill in template details:
   - Name (e.g., "Subscription Due Email")
   - Type (select from dropdown)
   - Channel (email, sms, push, database)
   - Subject (for email)
   - Message Body (use variable placeholders)
4. Set as Active and optionally as Default
5. Click **Create Template**

### 3. Send Notifications
The system automatically sends notifications based on configured triggers. Notifications are:
1. Created in the database with status "pending"
2. Queued for background processing
3. SendNotificationJob picks up and processes them
4. Status updated to "sending" → "sent" or "failed"
5. Failed notifications are automatically retried

### 4. Monitor and Retry
1. Navigate to **Notifications** (All Notifications)
2. Filter by status using the dropdown
3. View failed notifications with error messages
4. Click **Retry** button to manually retry failed notifications
5. System auto-retries with exponential backoff up to max retries

## Technical Details

### Services

**ChannelSettingService**
- `createOrUpdate()` - Create or update channel settings
- `activate()` / `deactivate()` - Toggle channel status
- `testConnection()` - Test channel connectivity
- `delete()` - Remove channel settings

**TemplateService**
- `create()` - Create new template
- `update()` - Update existing template
- `delete()` - Delete template
- `preview()` - Preview with sample data
- `renderForNotification()` - Render template for notification

### Jobs

**SendNotificationJob**
- Processes notifications from queue
- Updates status (pending → sending → sent/failed)
- Applies templates if configured
- Handles multi-channel sending
- Implements retry logic on failure

### Models

**NotificationChannelSetting**
- `getMaskedConfiguration()` - Hide sensitive data in responses
- `isConfigured()` - Check if channel is properly configured

**NotificationTemplate**
- `render()` - Render template with data
- `getAvailableVariables()` - Get template variables

**Notification** (enhanced)
- `canRetry()` - Check if notification can be retried
- `markAsSending()` / `markAsSent()` / `markAsFailed()`
- `calculateNextRetry()` - Calculate next retry time with exponential backoff

## Testing Checklist

### Backend Testing
- [ ] Create channel settings for each type
- [ ] Test SMTP connection with valid credentials
- [ ] Test SMTP connection with invalid credentials
- [ ] Create templates for different notification types
- [ ] Preview templates with sample data
- [ ] Set default templates
- [ ] Create notifications and verify they're queued
- [ ] Process notification queue
- [ ] Verify status transitions
- [ ] Test retry mechanism
- [ ] Verify exponential backoff timing

### Frontend Testing
- [ ] Navigate to Channel Settings page
- [ ] Switch between Email/SMS/Push tabs
- [ ] Fill and save channel configuration
- [ ] Test connection for each channel
- [ ] View test results (success/failure)
- [ ] Create a new template
- [ ] Edit existing template
- [ ] Delete template
- [ ] View notifications list
- [ ] Filter by status
- [ ] Mark notification as read
- [ ] Retry failed notification
- [ ] View error messages

### Integration Testing
- [ ] Configure email channel end-to-end
- [ ] Create email template
- [ ] Trigger notification creation
- [ ] Verify email is sent
- [ ] Test failed notification retry
- [ ] Verify status updates in real-time

## Next Steps

1. **Run Migrations**: Execute the new migration files
2. **Seed Data**: Create sample channel settings and templates
3. **Configure Queue**: Ensure Laravel queue worker is running
4. **Test SMTP**: Configure and test email sending
5. **UAT**: Perform user acceptance testing
6. **Documentation**: Update user-facing documentation
7. **Monitoring**: Set up monitoring for notification failures

## Maintenance

### Monitoring Failed Notifications
```php
// Get notifications that need retry
$failedNotifications = Notification::where('status', 'failed')
    ->where('retry_count', '<', DB::raw('max_retries'))
    ->whereNotNull('next_retry_at')
    ->where('next_retry_at', '<=', now())
    ->get();
```

### Clear Old Notifications
```php
// Delete notifications older than 90 days
Notification::where('created_at', '<', now()->subDays(90))->delete();
```

### View Channel Statistics
```php
// Count notifications by channel and status
Notification::select('channel', 'status', DB::raw('count(*) as total'))
    ->groupBy('channel', 'status')
    ->get();
```

## Security Considerations

1. **Credentials**: Channel credentials are stored encrypted in configuration JSON
2. **Masking**: Sensitive data is masked in API responses via `getMaskedConfiguration()`
3. **Validation**: All inputs are validated before storage
4. **Authorization**: Add middleware to restrict access to channel settings
5. **Rate Limiting**: Implement rate limiting for notification sending

## Support

For issues or questions:
1. Check this documentation
2. Review migration files in `database/migrations/`
3. Check controller logic in `app/Http/Controllers/Notification/`
4. Review service implementations in `app/Services/Notification/`
