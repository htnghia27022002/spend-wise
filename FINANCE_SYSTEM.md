# Hệ Thống Quản Lý Tài Chính Cá Nhân - Spend Wise

## 📋 Tổng Quan

Một hệ thống quản lý tài chính toàn diện với:
- ✅ Quản lý khoản thu/chi cơ bản
- ✅ Khoản chi định kỳ (Subscription) tự động
- ✅ Quản lý trả góp (Installment) với lịch thanh toán
- ✅ Nhắc nhở ngày đến hạn tự động
- ✅ Báo cáo tài chính & thống kê
- ✅ Quản lý nhiều ví/tài khoản

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend (Laravel 11)

#### Cấu trúc thư mục theo Feature

```
app/
├── Models/Finance/
│   ├── Wallet.php              # Ví/tài khoản
│   ├── Category.php            # Danh mục chi tiêu
│   ├── Transaction.php         # Giao dịch
│   ├── Subscription.php        # Khoản chi định kỳ
│   ├── Installment.php         # Khoản trả góp
│   ├── InstallmentPayment.php  # Lịch trả từng kỳ
│   ├── Notification.php        # Thông báo
│   └── NotificationSetting.php # Cài đặt thông báo
│
├── Services/Finance/
│   ├── WalletService.php
│   ├── CategoryService.php
│   ├── TransactionService.php
│   ├── SubscriptionService.php
│   ├── InstallmentService.php
│   └── NotificationService.php
│
├── Repositories/Finance/
│   ├── WalletRepository.php
│   ├── CategoryRepository.php
│   ├── TransactionRepository.php
│   ├── SubscriptionRepository.php
│   ├── InstallmentRepository.php
│   └── NotificationRepository.php
│
├── Http/Controllers/Finance/
│   ├── WalletController.php
│   ├── CategoryController.php
│   ├── TransactionController.php
│   ├── SubscriptionController.php
│   ├── InstallmentController.php
│   ├── NotificationController.php
│   └── DashboardController.php
│
├── Contracts/Finance/
│   ├── WalletServiceInterface.php
│   ├── CategoryServiceInterface.php
│   ├── TransactionServiceInterface.php
│   ├── SubscriptionServiceInterface.php
│   ├── InstallmentServiceInterface.php
│   └── NotificationServiceInterface.php
│
└── Jobs/Finance/
    └── ProcessFinanceScheduledJob.php
```

#### Database Schema

**Wallets** - Ví/tài khoản người dùng
- id, user_id, name, type, balance, currency, is_active

**Categories** - Danh mục chi tiêu (hỗ trợ cha-con)
- id, user_id, parent_id, name, type (income/expense), icon, color

**Transactions** - Giao dịch
- id, user_id, wallet_id, category_id, type (income/expense), amount, transaction_date
- is_installment, installment_payment_id, subscription_id

**Subscriptions** - Khoản chi định kỳ
- id, user_id, wallet_id, category_id, name, amount
- frequency (daily/weekly/monthly/yearly), start_date, end_date, due_day
- status (active/paused/ended), next_due_date

**Installments** - Khoản trả góp
- id, user_id, wallet_id, category_id, name, total_amount
- total_installments, amount_per_installment, start_date, due_day
- status, next_due_date

**InstallmentPayments** - Lịch trả từng kỳ
- id, installment_id, payment_number, amount, due_date
- status (unpaid/paid/overdue), paid_date, paid_amount

**Notifications** - Thông báo
- id, user_id, type, title, message, notifiable_id, notifiable_type
- read_at, sent, sent_at

**NotificationSettings** - Cài đặt thông báo người dùng
- user_id, subscription_due_enabled, installment_due_enabled
- days_before_due, notification_method

### Frontend (React + Inertia.js)

```
resources/js/
├── pages/Finance/
│   ├── Dashboard.tsx           # Trang tổng hợp
│   ├── Wallets/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Edit.tsx
│   ├── Categories/
│   │   ├── Index.tsx
│   │   └── Create.tsx
│   ├── Transactions/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Edit.tsx
│   ├── Subscriptions/
│   │   ├── Index.tsx
│   │   └── Create.tsx
│   ├── Installments/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   └── Notifications/
│       └── Index.tsx
│
├── components/Finance/
│   └── (Reusable components)
│
└── hooks/
    └── useFinanceNotifications.ts
```

---

## 🎯 Tính Năng Chi Tiết

### 1️⃣ Quản Lý Khoản Thu/Chi (Transactions)

**Tạo giao dịch:**
- Chọn ví/tài khoản
- Chọn danh mục
- Nhập số tiền
- Chọn loại (Thu/Chi)
- Ghi chú tùy chọn
- Tự động cập nhật số dư ví

**Thao tác:**
- Sửa, xóa giao dịch
- Xóa hàng loạt
- Lọc theo: Loại, danh mục, ví, ngày tháng
- Phân trang

**Business Logic:**
```
TransactionService.create():
  - Validate dữ liệu
  - Lưu giao dịch
  - Cập nhật số dư ví tương ứng
  - Return giao dịch mới tạo

TransactionService.update():
  - Rollback số dư ví cũ
  - Cập nhật giao dịch
  - Cập nhật số dư ví mới
  
TransactionService.delete():
  - Rollback số dư ví
  - Xóa giao dịch
```

### 2️⃣ Khoản Chi Định Kỳ (Subscriptions)

**Tạo subscription:**
- Tên khoản
- Số tiền mỗi kỳ
- Chu kỳ: ngày/tuần/tháng/năm
- Ngày bắt đầu
- Ngày kết thúc (tùy chọn)
- Ngày đến hạn mỗi kỳ

**Tự động:**
- `ProcessFinanceScheduledJob` chạy hàng ngày
- Sinh transaction mỗi kỳ tới hạn
- Tự động trừ tiền từ ví
- Tính toán ngày đến hạn tiếp theo

**Trạng thái:**
- active: Đang hoạt động
- paused: Tạm dừng
- ended: Đã kết thúc

**Tính toán ngày đến hạn:**
```
Daily: ngày tiếp theo
Weekly: tuần tiếp theo (cùng ngày trong tuần)
Monthly: ngày tương ứng tháng tiếp theo
Yearly: năm tiếp theo
```

### 3️⃣ Quản Lý Trả Góp (Installments)

**Tạo installment:**
- Tên khoản
- Tổng số tiền
- Số kỳ trả
- Số tiền mỗi kỳ (tự động tính)
- Ngày bắt đầu
- Ngày đến hạn mỗi kỳ

**Hệ thống tự động:**
- Sinh lịch các kỳ thanh toán (InstallmentPayment)
- Mỗi kỳ đến hạn → sinh transaction
- Cập nhật trạng thái: unpaid → paid/overdue

**Quản lý kỳ thanh toán:**
- Xem chi tiết từng kỳ
- Đánh dấu đã thanh toán
- Ghi chú thanh toán
- Tính ngày quá hạn tự động

**Trạng thái:**
- unpaid: Chưa trả
- paid: Đã thanh toán
- overdue: Quá hạn

### 4️⃣ Nhắc Nhở & Thông Báo

**Loại thông báo:**
- subscription_due: Đến hạn subscription
- subscription_overdue: Quá hạn subscription
- installment_due: Đến hạn kỳ trả
- installment_overdue: Quá hạn kỳ trả

**Cơ chế gửi:**
- Trước hạn X ngày (mặc định 3 ngày)
- Vào ngày đến hạn
- Khi quá hạn

**Cài đặt:**
- Bật/tắt từng loại thông báo
- Chọn số ngày nhắc trước
- Chọn hình thức: push/email/in-app/all

**Quy trình:**
```
Daily Job (00:00):
  1. Kiểm tra subscription/installment đến hạn hôm nay
  2. Sinh transaction + cập nhật ví
  3. Gửi thông báo đến hạn
  4. Kiểm tra & gửi thông báo quá hạn
```

### 5️⃣ Quản Lý Ví/Tài Khoản

**Tạo ví:**
- Tên ví
- Loại: Tiền mặt, ngân hàng, ví điện tử, thẻ tín dụng
- Số dư ban đầu
- Tiền tệ
- Mô tả

**Cập nhật số dư:**
```
Khi tạo/sửa/xóa transaction:
  expense: balance -= amount
  income: balance += amount

Khi có subscription/installment đến hạn:
  balance -= amount
```

**Trạng thái:**
- is_active: true/false

### 6️⃣ Danh Mục Chi Tiêu

**CRUD danh mục:**
- Tên danh mục
- Loại: Thu/Chi
- Danh mục cha-con
- Màu sắc
- Icon
- Mô tả

**Tính năng:**
- Sắp xếp lại thứ tự
- Lọc theo loại
- Lấy danh mục cấp 1 với con

### 7️⃣ Báo Cáo & Thống Kê

**Dashboard hiển thị:**
- Tổng số dư tất cả ví
- Tổng thu/chi kỳ này vs kỳ trước
- Biểu đồ tròn: Chi theo danh mục
- Biểu đồ cột: Thu-Chi theo ngày
- 10 giao dịch gần nhất
- Danh sách ví

**Lọc theo kỳ:**
- Tháng này
- Quý này
- Năm này

**Dữ liệu trả về:**
```javascript
{
  summary: {
    totalBalance,
    income,
    expense,
    difference (income - expense)
  },
  comparison: {
    incomeChange,
    expenseChange
  },
  expenseByCategory: [
    { name, color, amount, percentage }
  ],
  recentTransactions: [...],
  dailyData: [
    { date, income, expense }
  ]
}
```

---

## 📡 API Routes

### Wallets
```
GET    /wallets              - Danh sách ví
POST   /wallets              - Tạo ví
GET    /wallets/{id}/edit    - Form sửa ví
PUT    /wallets/{id}         - Cập nhật ví
DELETE /wallets/{id}         - Xóa ví
```

### Categories
```
GET    /categories           - Danh sách danh mục
POST   /categories           - Tạo danh mục
GET    /categories/{id}/edit - Form sửa danh mục
PUT    /categories/{id}      - Cập nhật danh mục
DELETE /categories/{id}      - Xóa danh mục
POST   /categories/reorder   - Sắp xếp lại thứ tự
```

### Transactions
```
GET    /transactions         - Danh sách giao dịch
POST   /transactions         - Tạo giao dịch
GET    /transactions/{id}/edit - Form sửa
PUT    /transactions/{id}    - Cập nhật giao dịch
DELETE /transactions/{id}    - Xóa giao dịch
POST   /transactions/bulk-delete - Xóa hàng loạt
```

### Subscriptions
```
GET    /subscriptions        - Danh sách
POST   /subscriptions        - Tạo
PUT    /subscriptions/{id}   - Cập nhật
DELETE /subscriptions/{id}   - Xóa
POST   /subscriptions/{id}/pause  - Tạm dừng
POST   /subscriptions/{id}/resume - Tiếp tục
```

### Installments
```
GET    /installments         - Danh sách
POST   /installments         - Tạo
GET    /installments/{id}    - Chi tiết
PUT    /installments/{id}    - Cập nhật
DELETE /installments/{id}    - Xóa
POST   /installments/{id}/pause   - Tạm dừng
POST   /installments/{id}/resume  - Tiếp tục
POST   /installments/{id}/mark-payment-paid - Đánh dấu đã trả
```

### Notifications
```
GET    /notifications        - Danh sách thông báo
GET    /notifications/unread - Thông báo chưa đọc
POST   /notifications/{id}/mark-as-read - Đánh dấu đã đọc
POST   /notifications/mark-all-as-read   - Đánh dấu tất cả
GET    /notifications/settings - Lấy cài đặt
POST   /notifications/settings - Cập nhật cài đặt
```

### Dashboard
```
GET    /finance/dashboard?period=month|quarter|year
```

---

## 🔄 Business Logic Flow

### Tạo Transaction
```
User input → Validate → Create transaction → Update wallet balance → Return
```

### Subscription Recurrence
```
Daily at 00:00:
  GET subscriptions with next_due_date = today
  FOR EACH subscription:
    CREATE transaction
    UPDATE wallet balance
    CALCULATE next_due_date
    UPDATE subscription
    IF end_date passed: mark as 'ended'
```

### Installment Payment
```
Daily at 00:00:
  GET all unpaid payments with due_date < today
  UPDATE status to 'overdue'
  
User mark payment as paid:
  UPDATE payment: status=paid, paid_date, paid_amount
  CREATE transaction
  UPDATE wallet balance
  CHECK if all payments paid
  IF yes: UPDATE installment status='completed'
```

### Notifications
```
Daily:
  GET settings dengan notification enabled
  FOR subscription_due: send if next_due_date = today + days_before
  FOR installment_due: send if due_date = today + days_before
  FOR overdue: send if due_date < today
  
Create notification record:
  - user_id, type, title, message
  - notifiable_type, notifiable_id
  - Mark as sent=true
```

---

## 🚀 Setup & Running

### 1. Migrations
```bash
docker exec -it frankenphp php artisan migrate
```

### 2. Service Provider (already registered)
```php
// AppServiceProvider.php
$this->app->bind(WalletServiceInterface::class, WalletService::class);
$this->app->bind(SubscriptionServiceInterface::class, SubscriptionService::class);
// ... etc
```

### 3. Schedule (Kernel.php)
```php
// Daily job at 00:00 Vietnam time
$schedule->job(new ProcessFinanceScheduledJob())
    ->dailyAt('00:00')
    ->timezone('Asia/Ho_Chi_Minh');
```

### 4. Start development
```bash
# Watch for file changes
docker exec -it frankenphp npm run dev

# Build for production
docker exec -it frankenphp npm run build
```

---

## 🔐 Security & Authorization

- **Authentication:** Laravel Fortify (2FA enabled)
- **Authorization:** Query-level user_id checks
- **Validation:** Server-side validation on all requests
- **CSRF:** Laravel CSRF middleware
- **Data isolation:** Users only see their own data

---

## 📊 Example Usage

### Create Subscription
```bash
POST /subscriptions
{
  "name": "Netflix",
  "wallet_id": 1,
  "category_id": 5,
  "amount": 149000,
  "frequency": "monthly",
  "start_date": "2024-01-28",
  "due_day": 28,
  "description": "Monthly subscription"
}

Response: Subscription with calculated next_due_date
```

### Create Installment
```bash
POST /installments
{
  "name": "Laptop Asus",
  "wallet_id": 1,
  "category_id": 8,
  "total_amount": 30000000,
  "total_installments": 12,
  "amount_per_installment": 2500000,
  "start_date": "2024-01-28",
  "due_day": 28,
  "description": "Mua laptop trả góp"
}

Response: Installment with 12 payment schedule created
```

### Mark Payment Paid
```bash
POST /installments/5/mark-payment-paid
{
  "paid_date": "2024-02-28",
  "paid_amount": 2500000,
  "notes": "Thanh toán kỳ 1"
}

Result:
  - Payment marked as paid
  - Transaction created
  - Wallet balance updated
  - Check if all payments paid → update status
```

---

## 📝 Notes

- Tất cả thời gian dùng timezone 'Asia/Ho_Chi_Minh'
- Tính toán ngày đến hạn tự động cho subscription
- Trạng thái overdue được cập nhật tự động hàng ngày
- Xóa subscription/installment không xóa transaction đã tạo
- Số dư ví có thể âm (tín dụng)

---

## 🔜 Enhancements (Future)

- [ ] Export báo cáo PDF/Excel
- [ ] Biểu đồ chi tiết hơn (Chart.js)
- [ ] Multi-currency support with conversion
- [ ] Budget tracking & alerts
- [ ] Financial goals
- [ ] Recurring reminders via email/SMS
- [ ] Mobile app
- [ ] Dark mode
- [ ] Sharing finances (family/team)

---

**Happy Financial Management! 💰**
