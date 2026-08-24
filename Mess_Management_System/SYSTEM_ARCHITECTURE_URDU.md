# 🏗️ MESS MANAGEMENT SYSTEM - مکمل آرکیٹیکچر

**تاریخ**: 10 مئی 2026  
**ورژن**: 2.2.0  
**زبان**: اردو + انگلش

---

## 📊 ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE STRUCTURE                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │  (منشی / ایڈمن)
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ email (unique)       │
│ password             │
│ role                 │  → MUNSHI
│ createdAt            │
│ updatedAt            │
└──────────────────────┘


┌──────────────────────┐
│      Student         │  (طالب علم)
├──────────────────────┤
│ id (PK)              │
│ name                 │  → نام
│ phone                │  → فون نمبر
│ room                 │  → کمرہ نمبر
│ hall                 │  → ہال / ہاسٹل ⭐ NEW
│ status               │  → ACTIVE / ARCHIVED
│ balance              │  → بیلنس (روپے)
│ joinedAt             │  → شمولیت کی تاریخ
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
         │
         │ One-to-Many
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Attendance│ │ Payment  │ │Transaction│ │          │
└─────────┘ └──────────┘ └──────────┘ │          │
                                       │          │


┌──────────────────────┐
│    Attendance        │  (حاضری)
├──────────────────────┤
│ id (PK)              │
│ studentId (FK)       │  → Student.id
│ date                 │  → تاریخ
│ status               │  → PRESENT / ABSENT / LEAVE
│ cost                 │  → روزانہ چارج
│ createdAt            │
└──────────────────────┘
│
│ Unique: (studentId, date)
│ Index: studentId, date, status


┌──────────────────────┐
│     Payment          │  (ادائیگی / جمع)
├──────────────────────┤
│ id (PK)              │
│ studentId (FK)       │  → Student.id
│ amount               │  → رقم
│ month                │  → مہینہ
│ year                 │  → سال
│ status               │  → PENDING / PAID / PARTIAL
│ paidAt               │  → ادائیگی کی تاریخ
│ note                 │  → نوٹ
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
│
│ Unique: (studentId, month, year)
│ Index: studentId, month, year, status


┌──────────────────────┐
│   Transaction        │  (لین دین)
├──────────────────────┤
│ id (PK)              │
│ studentId (FK)       │  → Student.id
│ amount               │  → رقم
│ type                 │  → DEPOSIT / MEAL_CHARGE / REFUND
│ method               │  → CASH / EASYPAISA / JAZZCASH / BANK_TRANSFER
│ description          │  → تفصیل
│ date                 │  → تاریخ
│ createdAt            │
└──────────────────────┘
│
│ Index: studentId, date, type, createdAt


┌──────────────────────┐
│      Expense         │  (اخراجات)
├──────────────────────┤
│ id (PK)              │
│ title                │  → عنوان
│ amount               │  → رقم
│ category             │  → قسم
│ date                 │  → تاریخ
│ description          │  → تفصیل
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
│
│ Index: date, category


┌──────────────────────┐
│   SystemConfig       │  (سسٹم کی ترتیبات)
├──────────────────────┤
│ id (PK)              │
│ key (unique)         │
│ value                │
└──────────────────────┘
```

---

## 🔗 RELATIONSHIPS (تعلقات)

### 1. Student → Attendance (One-to-Many)
```
ایک طالب علم کی بہت سی حاضریاں ہو سکتی ہیں
- ہر دن کے لیے ایک حاضری ریکارڈ
- Unique constraint: (studentId, date)
- Cascade delete: اگر طالب علم delete ہو تو اس کی حاضریاں بھی delete ہوں
```

### 2. Student → Payment (One-to-Many)
```
ایک طالب علم کی بہت سی ادائیگیاں ہو سکتی ہیں
- ہر مہینے کے لیے ایک payment ریکارڈ
- Unique constraint: (studentId, month, year)
- Cascade delete: اگر طالب علم delete ہو تو اس کی payments بھی delete ہوں
```

### 3. Student → Transaction (One-to-Many)
```
ایک طالب علم کے بہت سے لین دین ہو سکتے ہیں
- ہر deposit, charge, refund کے لیے ایک transaction
- No cascade delete: transactions history رہنی چاہیے
```

### 4. Expense (Independent)
```
Expenses کسی student سے linked نہیں
- یہ mess کے عمومی اخراجات ہیں
- سبزی، گوشت، گیس، تنخواہ وغیرہ
```

---

## 📐 ENUMS (مقررہ اقدار)

### Role (کردار)
```typescript
enum Role {
  MUNSHI  // منشی / ایڈمن
}
```

### StudentStatus (طالب علم کی حیثیت)
```typescript
enum StudentStatus {
  ACTIVE    // فعال - mess میں ہے
  ARCHIVED  // محفوظ - mess چھوڑ چکا
}
```

### AttendanceStatus (حاضری کی حیثیت)
```typescript
enum AttendanceStatus {
  PRESENT  // حاضر - چارج ہوگا
  ABSENT   // غیر حاضر - چارج ہوگا
  LEAVE    // رخصت - چارج نہیں ہوگا
}
```

### PaymentStatus (ادائیگی کی حیثیت)
```typescript
enum PaymentStatus {
  PENDING  // زیر التواء
  PAID     // ادا شدہ
  PARTIAL  // جزوی
}
```

### TransactionType (لین دین کی قسم)
```typescript
enum TransactionType {
  DEPOSIT      // جمع - طالب علم نے پیسے دیے
  MEAL_CHARGE  // کھانے کا چارج - روزانہ کٹوتی
  REFUND       // واپسی - پیسے واپس
}
```

### PaymentMethod (ادائیگی کا طریقہ)
```typescript
enum PaymentMethod {
  CASH           // نقد
  EASYPAISA      // ایزی پیسہ
  JAZZCASH       // جاز کیش
  BANK_TRANSFER  // بینک ٹرانسفر
}
```

### ExpenseCategory (اخراجات کی قسم)
```typescript
enum ExpenseCategory {
  VEGETABLES  // سبزیاں
  MEAT        // گوشت
  RICE        // چاول
  FLOUR       // آٹا
  GAS         // گیس
  UTILITIES   // بجلی، پانی
  SALARY      // تنخواہ
  GROCERY     // گروسری
  OTHER       // دیگر
}
```

### Hall (ہال / ہاسٹل) ⭐ NEW
```typescript
enum Hall {
  FAISAL_HALL   // فیصل ہال
  ATIQUE_HALL   // عتیق ہال
  GHAZALI_HALL  // غزالی ہال
  ABBAS_MANZIL  // عباس منزل
  PGR_HOSTEL    // پی جی آر ہاسٹل
  JOHAR_HALL    // جوہر ہال
}
```

---

## 🔄 DATA FLOW (ڈیٹا کا بہاؤ)

### 1. نیا طالب علم شامل کرنا

```
Admin → Frontend (Students Page)
  ↓
  نام، فون، کمرہ، ہال، بیلنس داخل کریں
  ↓
POST /api/v1/students
  ↓
Backend (StudentsController)
  ↓
StudentsService.create()
  ↓
Prisma → Database
  ↓
Student record بن گیا
  ↓
Response → Frontend
  ↓
Student card دکھائی دے گا (نام، کمرہ، ہال، بیلنس)
```

### 2. حاضری لگانا

```
Admin → Frontend (Attendance Page)
  ↓
  تاریخ منتخب کریں
  ↓
GET /api/v1/attendance/all-students?date=YYYY-MM-DD
  ↓
Backend (AttendanceController)
  ↓
AttendanceService.getAllStudentsWithAttendance()
  ↓
Prisma:
  - تمام ACTIVE students fetch کریں
  - اس تاریخ کی attendance fetch کریں
  - اگر attendance نہیں تو default PRESENT
  ↓
Response → Frontend
  ↓
Table میں تمام students دکھائی دیں
  ↓
Admin status buttons click کرے (حاضر/غیر حاضر/رخصت)
  ↓
POST /api/v1/attendance/save-all
  ↓
Backend:
  - ہر student کی attendance save کریں
  - اگر PRESENT/ABSENT تو cost calculate کریں
  - اگر LEAVE تو cost = 0
  - Student.balance سے cost minus کریں
  - Transaction بنائیں (type: MEAL_CHARGE)
  ↓
Database updated
  ↓
Response → Frontend
  ↓
Success message
```

### 3. ادائیگی/جمع کرنا

```
Admin → Frontend (Payments Page)
  ↓
  "نئی ادائیگی" click کریں
  ↓
  Student منتخب کریں
  Amount داخل کریں
  Payment method منتخب کریں
  ↓
POST /api/v1/payments
  ↓
Backend (PaymentsController)
  ↓
PaymentsService.create()
  ↓
Prisma Transaction (atomic):
  1. Payment record بنائیں
  2. Student.balance میں amount add کریں
  3. Transaction بنائیں (type: DEPOSIT)
  ↓
Database updated (تینوں ایک ساتھ)
  ↓
Response → Frontend
  ↓
Success message
  ↓
Balance فوری طور پر update ہو جائے گا:
  - Members page میں
  - Attendance page میں
  - Student profile میں
```

### 4. اخراجات شامل کرنا

```
Admin → Frontend (Expenses Page)
  ↓
  "نیا اخراجہ" click کریں
  ↓
  عنوان، رقم، قسم، تاریخ داخل کریں
  ↓
POST /api/v1/expenses
  ↓
Backend (ExpensesController)
  ↓
ExpensesService.create()
  ↓
Prisma → Database
  ↓
Expense record بن گیا
  ↓
Response → Frontend
  ↓
Expense list میں دکھائی دے گا
```

---

## 💰 BALANCE CALCULATION (بیلنس کا حساب)

### فارمولا:
```
Current Balance = Initial Balance + Total Deposits - Total Charges

جہاں:
- Initial Balance = طالب علم شامل ہوتے وقت دی گئی رقم
- Total Deposits = تمام payments کا مجموعہ
- Total Charges = تمام attendance charges کا مجموعہ
```

### مثال:
```
Initial Balance:     10,000 روپے
+ Deposit (Jan):      5,000 روپے
+ Deposit (Feb):      5,000 روپے
- Charges (30 days): -6,000 روپے (200/day × 30)
- Charges (28 days): -5,600 روپے (200/day × 28)
─────────────────────────────
Current Balance:      8,400 روپے
```

### Single Source of Truth:
```
student.balance ہی اصل balance ہے

✅ یہ field ہر جگہ استعمال ہوتا ہے:
  - Members page
  - Attendance page
  - Student profile
  - Dashboard stats
  - Reports

❌ کوئی دوسری جگہ balance store نہیں ہوتا
```

---

## 🏗️ SYSTEM ARCHITECTURE (سسٹم کی تعمیر)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                  (صارف کی سطح - Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Next.js 14 + TypeScript + Tailwind CSS                     │
│  http://localhost:3002                                       │
│                                                              │
│  Pages (صفحات):                                              │
│  ├─ Dashboard (ڈیش بورڈ)                                     │
│  ├─ Students (ممبرز)                                         │
│  ├─ Attendance (حاضری)                                       │
│  ├─ Payments (ادائیگیاں)                                     │
│  ├─ Expenses (اخراجات)                                       │
│  └─ Reports (رپورٹس)                                         │
│                                                              │
│  State Management:                                           │
│  └─ React Context API (AuthContext)                         │
│                                                              │
│  API Client:                                                 │
│  └─ Axios (JWT token handling)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP REST API
                            │ JSON format
                            │
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                   (ایپلیکیشن کی سطح - Backend)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  NestJS + TypeScript                                         │
│  http://localhost:3001/api/v1                                │
│                                                              │
│  Modules (ماڈیولز):                                          │
│  ├─ AuthModule (تصدیق)                                       │
│  │   ├─ JWT Strategy                                        │
│  │   ├─ JWT Guard                                           │
│  │   └─ Roles Guard                                         │
│  │                                                           │
│  ├─ StudentsModule (طلباء)                                   │
│  │   ├─ StudentsController                                  │
│  │   └─ StudentsService                                     │
│  │                                                           │
│  ├─ AttendanceModule (حاضری)                                 │
│  │   ├─ AttendanceController                                │
│  │   └─ AttendanceService                                   │
│  │                                                           │
│  ├─ PaymentsModule (ادائیگیاں)                               │
│  │   ├─ PaymentsController                                  │
│  │   └─ PaymentsService                                     │
│  │                                                           │
│  ├─ ExpensesModule (اخراجات)                                 │
│  │   ├─ ExpensesController                                  │
│  │   └─ ExpensesService                                     │
│  │                                                           │
│  ├─ TransactionsModule (لین دین)                             │
│  │   ├─ TransactionsController                              │
│  │   └─ TransactionsService                                 │
│  │                                                           │
│  ├─ DashboardModule (ڈیش بورڈ)                               │
│  │   ├─ DashboardController                                 │
│  │   └─ DashboardService                                    │
│  │                                                           │
│  ├─ ReportsModule (رپورٹس)                                   │
│  │   ├─ ReportsController                                   │
│  │   └─ ReportsService                                      │
│  │                                                           │
│  ├─ UsersModule (صارفین)                                     │
│  │   ├─ UsersController                                     │
│  │   └─ UsersService                                        │
│  │                                                           │
│  └─ PrismaModule (ڈیٹا بیس)                                  │
│      └─ PrismaService                                        │
│                                                              │
│  Common (عام):                                               │
│  ├─ Global Exception Filter                                 │
│  └─ Response Interceptor                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            │ Type-safe queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                  (ڈیٹا کی سطح - Database)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PostgreSQL Database                                         │
│  localhost:5432                                              │
│  Database: messdb                                            │
│                                                              │
│  Tables (جدولیں):                                            │
│  ├─ users (صارفین)                                           │
│  ├─ students (طلباء)                                         │
│  ├─ attendance (حاضری)                                       │
│  ├─ payments (ادائیگیاں)                                     │
│  ├─ transactions (لین دین)                                   │
│  ├─ expenses (اخراجات)                                       │
│  └─ system_config (ترتیبات)                                 │
│                                                              │
│  Indexes (اشاریے):                                          │
│  └─ 20+ indexes for performance                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY (حفاظت)

### Authentication (تصدیق)
```
1. Admin login کرتا ہے
   ↓
2. Backend JWT token بناتا ہے
   ↓
3. Token frontend میں localStorage میں save ہوتا ہے
   ↓
4. ہر API request میں token بھیجا جاتا ہے
   ↓
5. Backend token verify کرتا ہے
   ↓
6. اگر valid ہے تو request process ہوتی ہے
   ↓
7. اگر invalid ہے تو 401 Unauthorized
```

### Authorization (اجازت)
```
- JWT Guard: تمام routes protected ہیں
- Roles Guard: صرف MUNSHI role access کر سکتا ہے
- Token expiry: 7 دن بعد expire ہو جاتا ہے
```

---

## 📊 API ENDPOINTS (API کے راستے)

### Auth (تصدیق)
```
POST   /api/v1/auth/login     - لاگ ان
POST   /api/v1/auth/signup    - سائن اپ
```

### Students (طلباء)
```
GET    /api/v1/students       - تمام students
GET    /api/v1/students/:id   - ایک student
POST   /api/v1/students       - نیا student
PATCH  /api/v1/students/:id   - student update
DELETE /api/v1/students/:id   - student delete
```

### Attendance (حاضری)
```
GET    /api/v1/attendance/all-students?date=YYYY-MM-DD  - تمام students + attendance
POST   /api/v1/attendance/save-all                      - تمام attendance save
GET    /api/v1/attendance                               - attendance history
POST   /api/v1/attendance                               - نئی attendance
```

### Payments (ادائیگیاں)
```
GET    /api/v1/payments       - تمام payments
POST   /api/v1/payments       - نئی payment
PATCH  /api/v1/payments/:id   - payment update
```

### Expenses (اخراجات)
```
GET    /api/v1/expenses       - تمام expenses
POST   /api/v1/expenses       - نیا expense
GET    /api/v1/expenses/summary - expenses کا خلاصہ
DELETE /api/v1/expenses/:id   - expense delete
```

### Transactions (لین دین)
```
GET    /api/v1/transactions/student/:studentId  - student کے transactions
POST   /api/v1/transactions                      - نیا transaction
```

### Dashboard (ڈیش بورڈ)
```
GET    /api/v1/dashboard/stats  - تمام statistics
```

### Reports (رپورٹس)
```
GET    /api/v1/reports/ledger          - لیجر رپورٹ
GET    /api/v1/reports/attendance      - حاضری رپورٹ
GET    /api/v1/reports/expenses        - اخراجات رپورٹ
GET    /api/v1/reports/profit-loss     - منافع/نقصان رپورٹ
```

### Users (صارفین)
```
GET    /api/v1/users/me       - موجودہ user کی معلومات
```

---

## 🎯 KEY FEATURES (اہم خصوصیات)

### 1. Single Source of Truth
```
✅ student.balance - ایک ہی جگہ balance
✅ student.hall - ایک ہی جگہ hall
✅ کوئی data duplication نہیں
✅ تمام modules ایک ہی data استعمال کرتے ہیں
```

### 2. Atomic Transactions
```
✅ Payment create کرتے وقت:
   - Payment record بنتا ہے
   - Balance update ہوتا ہے
   - Transaction record بنتا ہے
   - تینوں ایک ساتھ (atomically)
   
✅ اگر کوئی ایک fail ہو تو سب rollback
```

### 3. Real-time Synchronization
```
✅ Payment add کریں → Balance فوری update
✅ Attendance mark کریں → Balance فوری update
✅ کوئی manual refresh نہیں چاہیے
```

### 4. Performance Optimization
```
✅ 20+ database indexes
✅ Optimized queries
✅ Batch processing for attendance
✅ Fast loading times
```

### 5. Data Consistency
```
✅ Unique constraints
✅ Foreign key relationships
✅ Cascade deletes
✅ Validation at DTO level
```

---

## 📈 SCALABILITY (توسیع پذیری)

### موجودہ حد:
```
- Students: لامحدود
- Attendance records: لامحدود
- Payments: لامحدود
- Transactions: لامحدود
- Expenses: لامحدود
```

### مستقبل کی توسیع:
```
✅ Hall-wise filtering
✅ Hall-wise reports
✅ Multiple mess support
✅ SMS notifications
✅ Email reports
✅ Mobile app
✅ Advanced analytics
✅ Automated billing
```

---

## 🎨 UI/UX DESIGN

### رنگ (Colors):
```
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Hall: Emerald (#10B981)
```

### فونٹ (Fonts):
```
- اردو: Noto Nastaliq Urdu
- انگلش: Inter, system fonts
```

### لے آؤٹ (Layout):
```
- Sidebar navigation (دائیں طرف)
- Main content area (بائیں طرف)
- Responsive design
- Mobile-friendly
```

---

## ✅ SYSTEM STATUS

```
Backend:      ✅ Running (Port 3001)
Frontend:     ✅ Running (Port 3002)
Database:     ✅ Connected (PostgreSQL)
Hall System:  ✅ Active
Balance Sync: ✅ Working
Attendance:   ✅ Working
Payments:     ✅ Working
Reports:      ✅ Working

Status: 🟢 ALL SYSTEMS OPERATIONAL
```

---

**یہ آپ کے Mess Management System کا مکمل آرکیٹیکچر ہے!**

اب آپ آسانی سے ERD بنا سکتے ہیں یا کسی کو بھی سسٹم سمجھا سکتے ہیں۔
