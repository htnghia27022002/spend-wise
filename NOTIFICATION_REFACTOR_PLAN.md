# Notification System Refactoring Plan

## 📦 Recommended Packages

### 1. Email
- **Built-in Laravel Mail** ✅ (Already available)
  - Supports: SMTP, Mailgun, Postmark, Amazon SES, Sendmail
  - Config: `config/mail.php`
  
- **Additional (Optional)**:
  - `spatie/laravel-mail-preview` - Preview emails before sending
  - `symfony/mailer` - Already included in Laravel

### 2. SMS
- **Option 1: `laravel-notification-channels/twilio`** ⭐ Recommended
  ```bash
  composer require laravel-notification-channels/twilio
  ```
  
- **Option 2: `aws/aws-sdk-php`** - For AWS SNS
  ```bash
  composer require aws/aws-sdk-php
  ```

- **Option 3: Custom adapter** - For local SMS providers

### 3. Push Notification
- **Option 1: `laravel-notification-channels/fcm`** ⭐ Firebase
  ```bash
  composer require laravel-notification-channels/fcm
  ```

- **Option 2: `laravel-notification-channels/webpush`** - Web Push
  ```bash
  composer require laravel-notification-channels/webpush
  ```

- **Option 3: `pusher/pusher-php-server`** - Real-time
  ```bash
  composer require pusher/pusher-php-server
  ```

### 4. Email Template Builder
- **Option 1: Custom HTML Editor** (Recommended for flexibility)
  - Use TinyMCE/Quill on frontend
  - Save HTML to database
  
- **Option 2: `maizzle/framework`** - Email framework
  - For building email templates
  
- **Option 3: Store MJML** and convert to HTML
  ```bash
  npm install mjml
  ```

---

## 🏗️ Architecture Design

### 1. Provider System

```php
// Providers Configuration Structure
notification_providers
├── id
├── name (e.g., "SendGrid Email", "Twilio SMS")
├── type (email, sms, push)
├── driver (sendgrid, twilio, fcm, smtp)
├── config (JSON: credentials, settings)
├── is_active
├── is_default
├── priority
└── timestamps

// Example config JSON:
{
  "sendgrid": {
    "api_key": "SG.xxx",
    "from_email": "noreply@example.com",
    "from_name": "SpendWise"
  },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "user@gmail.com",
    "password": "encrypted",
    "encryption": "tls"
  }
}
```

### 2. Adapter Pattern

```
app/Services/Notification/
├── Adapters/
│   ├── Email/
│   │   ├── EmailAdapterInterface.php
│   │   ├── SmtpAdapter.php
│   │   ├── SendGridAdapter.php
│   │   └── AwsSesAdapter.php
│   ├── Sms/
│   │   ├── SmsAdapterInterface.php
│   │   ├── TwilioAdapter.php
│   │   └── AwsSnsAdapter.php
│   └── Push/
│       ├── PushAdapterInterface.php
│       ├── FcmAdapter.php
│       └── OneSignalAdapter.php
├── ProviderManager.php
└── ChannelDispatcher.php
```

### 3. Template System

```
notification_templates
├── id
├── name
├── type (notification type from registry)
├── channel (email, sms, push)
├── subject (email only)
├── body (HTML for email, text for SMS)
├── variables (JSON array: ['name', 'amount', 'date'])
├── is_active
├── is_default
└── timestamps

// Template Variable Syntax: {{variable_name}}
// Example:
"Hello {{user_name}}, your payment of {{amount}} is due on {{due_date}}"
```

---

## 📋 Implementation Tasks

### Phase 1: Provider Infrastructure ✅
1. ✅ Create migration for `notification_providers` table
2. ✅ Create NotificationProvider model
3. ✅ Create ProviderRepository
4. ✅ Create ProviderService with CRUD operations
5. ✅ Update Enums for provider types/drivers

### Phase 2: Adapter Implementation
6. Create adapter interfaces for Email/SMS/Push
7. Implement SMTP email adapter (using Laravel Mail)
8. Implement SendGrid adapter (optional)
9. Implement Twilio SMS adapter
10. Implement FCM push adapter
11. Create ProviderManager to route to correct adapter

### Phase 3: Template Enhancement
12. Update template migration to separate by channel
13. Create template rendering service with {{variable}} replacement
14. Add validation for required variables
15. Create preview functionality

### Phase 4: Frontend Integration
16. Create email template builder UI (rich text editor)
17. Create SMS template editor (plain text with variables)
18. Create provider configuration UI
19. Add template preview modal

### Phase 5: Queue & Retry Logic
20. Create notification jobs for async sending
21. Implement retry logic for failed notifications
22. Add webhook handling for delivery status
23. Create notification logs/tracking

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
# For SMS
docker exec -it frankenphp bash -c "cd /app/spend-wise && composer require laravel-notification-channels/twilio"

# For Push Notification
docker exec -it frankenphp bash -c "cd /app/spend-wise && composer require laravel-notification-channels/fcm"

# Optional: Email preview
docker exec -it frankenphp bash -c "cd /app/spend-wise && composer require spatie/laravel-mail-preview --dev"
```

### Step 2: Create Provider Infrastructure
- Run migration for providers table
- Seed default providers (SMTP, etc.)
- Build provider CRUD interface

### Step 3: Implement Adapters
- Start with Email (easiest - Laravel built-in)
- Then SMS (Twilio)
- Finally Push (FCM)

---

## 📊 Database Schema

```sql
-- notification_providers
CREATE TABLE notification_providers (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    type ENUM('email', 'sms', 'push'),
    driver VARCHAR(100), -- smtp, sendgrid, twilio, fcm
    config JSON, -- Provider-specific configuration
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0, -- Higher = preferred
    last_used_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- notification_templates (existing - will enhance)
-- Add metadata column for channel-specific settings
ALTER TABLE notification_templates ADD COLUMN metadata JSON;
-- metadata example: {"text_version": "...", "preheader": "...", "attachments": []}
```

---

## 🎯 Next Steps

Would you like me to:
1. **Start with Phase 1** - Create provider infrastructure?
2. **Install packages first** - Add Twilio/FCM dependencies?
3. **Focus on templates** - Build email template system first?
4. **Something else** - Specify which part to prioritize?

Let me know and I'll implement step by step! 🚀
