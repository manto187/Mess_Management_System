# 📊 ENTITY RELATIONSHIP DIAGRAM (ERD)

**Project**: Mess Management System  
**Version**: 2.2.0  
**Date**: May 10, 2026

---

## 🎨 VISUAL ERD DIAGRAM

```
                                    ┌─────────────────────────────────────┐
                                    │            User                     │
                                    │         (منشی / ایڈمن)              │
                                    ├─────────────────────────────────────┤
                                    │ 🔑 id: String (PK)                  │
                                    │    name: String                     │
                                    │    email: String (UNIQUE)           │
                                    │    password: String                 │
                                    │    role: Role (MUNSHI)              │
                                    │    createdAt: DateTime              │
                                    │    updatedAt: DateTime              │
                                    └─────────────────────────────────────┘
                                                   │
                                                   │ manages
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    Student                                           │
│                                 (طالب علم - مرکزی)                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 🔑 id: String (PK)                                                                   │
│    name: String                          ← نام                                      │
│    phone: String?                        ← فون نمبر                                 │
│    room: String?                         ← کمرہ نمبر                                │
│    hall: Hall? (ENUM)                    ← ہال / ہاسٹل ⭐ NEW                       │
│    status: StudentStatus (ENUM)          ← ACTIVE / ARCHIVED                        │
│    balance: Float                        ← بیلنس (روپے) 💰 SINGLE SOURCE OF TRUTH   │
│    joinedAt: DateTime                    ← شمولیت کی تاریخ                          │
│    createdAt: DateTime                                                               │
│    updatedAt: DateTime                                                               │
│                                                                                      │
│ 📊 Indexes: status, balance, name, room, hall                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │                    │
         │                    │                    │                    │
         │ 1                  │ 1                  │ 1                  │
         │                    │                    │                    │
         │ has many           │ has many           │ has many           │
         │                    │                    │                    │
         ▼ *                  ▼ *                  ▼ *                  │
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│   Attendance     │  │     Payment      │  │   Transaction    │      │
│    (حاضری)       │  │   (ادائیگی)      │  │    (لین دین)     │      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│ 🔑 id: String    │  │ 🔑 id: String    │  │ 🔑 id: String    │      │
│ 🔗 studentId: FK │  │ 🔗 studentId: FK │  │ 🔗 studentId: FK │      │
│    date: Date    │  │    amount: Float │  │    amount: Float │      │
│    status: ENUM  │  │    month: Int    │  │    type: ENUM    │      │
│    cost: Float   │  │    year: Int     │  │    method: ENUM? │      │
│    createdAt     │  │    status: ENUM  │  │    description?  │      │
│                  │  │    paidAt: Date? │  │    date: Date    │      │
│ Status:          │  │    note: String? │  │    createdAt     │      │
│ • PRESENT        │  │    createdAt     │  │                  │      │
│ • ABSENT         │  │    updatedAt     │  │ Type:            │      │
│ • LEAVE          │  │                  │  │ • DEPOSIT        │      │
│                  │  │ Status:          │  │ • MEAL_CHARGE    │      │
│ 🔒 UNIQUE:       │  │ • PENDING        │  │ • REFUND         │      │
│ (studentId,date) │  │ • PAID           │  │                  │      │
│                  │  │ • PARTIAL        │  │ Method:          │      │
│ 🗑️ CASCADE       │  │                  │  │ • CASH           │      │
│ DELETE           │  │ 🔒 UNIQUE:       │  │ • EASYPAISA      │      │
│                  │  │ (studentId,      │  │ • JAZZCASH       │      │
│ 📊 Indexes:      │  │  month, year)    │  │ • BANK_TRANSFER  │      │
│ studentId, date, │  │                  │  │                  │      │
│ status           │  │ 🗑️ CASCADE       │  │ 📊 Indexes:      │      │
│                  │  │ DELETE           │  │ studentId, date, │      │
│                  │  │                  │  │ type, createdAt  │      │
│                  │  │ 📊 Indexes:      │  │                  │      │
│                  │  │ studentId, month,│  │                  │      │
│                  │  │ year, status     │  │                  │      │
└──────────────────┘  └──────────────────┘  └──────────────────┘      │
                                                                       │
                                                                       │
                                                                       │
                                    ┌──────────────────────────────────┘
                                    │
                                    │ independent
                                    │
                                    ▼
                          ┌──────────────────┐
                          │     Expense      │
                          │    (اخراجات)     │
                          ├──────────────────┤
                          │ 🔑 id: String    │
                          │    title: String │
                          │    amount: Float │
                          │    category:ENUM │
                          │    date: Date    │
                          │    description?  │
                          │    createdAt     │
                          │    updatedAt     │
                          │                  │
                          │ Category:        │
                          │ • VEGETABLES     │
                          │ • MEAT           │
                          │ • RICE           │
                          │ • FLOUR          │
                          │ • GAS            │
                          │ • UTILITIES      │
                          │ • SALARY         │
                          │ • GROCERY        │
                          │ • OTHER          │
                          │                  │
                          │ 📊 Indexes:      │
                          │ date, category   │
                          └──────────────────┘


                          ┌──────────────────┐
                          │  SystemConfig    │
                          │   (ترتیبات)      │
                          ├──────────────────┤
                          │ 🔑 id: String    │
                          │    key: String   │
                          │    value: String │
                          │                  │
                          │ 🔒 UNIQUE: key   │
                          └──────────────────┘
```

---

## 🔗 RELATIONSHIP DETAILS

### 1️⃣ Student → Attendance (One-to-Many)

```
┌─────────┐         ┌────────────┐
│ Student │ 1 ────* │ Attendance │
└─────────┘         └────────────┘

Relationship Type: One-to-Many
Foreign Key: Attendance.studentId → Student.id
Cascade: ON DELETE CASCADE
Unique Constraint: (studentId, date)

Meaning (مطلب):
- ایک طالب علم کی بہت سی حاضریاں ہو سکتی ہیں
- ہر دن کے لیے ایک حاضری ریکارڈ
- اگر طالب علم delete ہو تو اس کی تمام حاضریاں بھی delete ہوں

Example:
Student "علی خان" (id: abc123)
  ├─ Attendance (2026-05-01) → PRESENT
  ├─ Attendance (2026-05-02) → PRESENT
  ├─ Attendance (2026-05-03) → LEAVE
  └─ Attendance (2026-05-04) → ABSENT
```

### 2️⃣ Student → Payment (One-to-Many)

```
┌─────────┐         ┌─────────┐
│ Student │ 1 ────* │ Payment │
└─────────┘         └─────────┘

Relationship Type: One-to-Many
Foreign Key: Payment.studentId → Student.id
Cascade: ON DELETE CASCADE
Unique Constraint: (studentId, month, year)

Meaning (مطلب):
- ایک طالب علم کی بہت سی ادائیگیاں ہو سکتی ہیں
- ہر مہینے کے لیے ایک payment ریکارڈ
- اگر طالب علم delete ہو تو اس کی تمام payments بھی delete ہوں

Example:
Student "علی خان" (id: abc123)
  ├─ Payment (Jan 2026) → 5000 روپے
  ├─ Payment (Feb 2026) → 5000 روپے
  └─ Payment (Mar 2026) → 5000 روپے
```

### 3️⃣ Student → Transaction (One-to-Many)

```
┌─────────┐         ┌─────────────┐
│ Student │ 1 ────* │ Transaction │
└─────────┘         └─────────────┘

Relationship Type: One-to-Many
Foreign Key: Transaction.studentId → Student.id
Cascade: NO CASCADE (history preserved)

Meaning (مطلب):
- ایک طالب علم کے بہت سے لین دین ہو سکتے ہیں
- ہر deposit, charge, refund کے لیے ایک transaction
- طالب علم delete ہونے پر بھی transactions محفوظ رہیں

Example:
Student "علی خان" (id: abc123)
  ├─ Transaction (DEPOSIT)      → +5000 روپے
  ├─ Transaction (MEAL_CHARGE)  → -200 روپے
  ├─ Transaction (MEAL_CHARGE)  → -200 روپے
  └─ Transaction (DEPOSIT)      → +3000 روپے
```

### 4️⃣ Expense (Independent)

```
┌─────────┐
│ Expense │  (کسی سے linked نہیں)
└─────────┘

Relationship Type: Independent
No Foreign Keys

Meaning (مطلب):
- Expenses کسی student سے linked نہیں
- یہ mess کے عمومی اخراجات ہیں
- سبزی، گوشت، گیس، تنخواہ وغیرہ

Example:
  ├─ Expense (سبزیاں)  → 2000 روپے
  ├─ Expense (گوشت)    → 5000 روپے
  └─ Expense (گیس)     → 3000 روپے
```

---

## 📐 CARDINALITY (تعداد کا تعلق)

```
User (1) ──manages──> Student (*)
  ایک منشی بہت سے طلباء کو manage کرتا ہے

Student (1) ──has──> Attendance (*)
  ایک طالب علم کی بہت سی حاضریاں

Student (1) ──has──> Payment (*)
  ایک طالب علم کی بہت سی ادائیگیاں

Student (1) ──has──> Transaction (*)
  ایک طالب علم کے بہت سے لین دین

Expense (independent)
  اخراجات آزاد ہیں
```

---

## 🔑 PRIMARY KEYS (بنیادی چابیاں)

```
User.id              → String (CUID)
Student.id           → String (CUID)
Attendance.id        → String (UUID)
Payment.id           → String (CUID)
Transaction.id       → String (UUID)
Expense.id           → String (CUID)
SystemConfig.id      → String (default: "config")
```

---

## 🔗 FOREIGN KEYS (غیر ملکی چابیاں)

```
Attendance.studentId    → Student.id (CASCADE DELETE)
Payment.studentId       → Student.id (CASCADE DELETE)
Transaction.studentId   → Student.id (NO CASCADE)
```

---

## 🔒 UNIQUE CONSTRAINTS (منفرد پابندیاں)

```
User.email                           → ایک email صرف ایک بار
Student.id                           → ہر student کی unique id
Attendance.(studentId, date)         → ایک student کی ایک دن میں ایک حاضری
Payment.(studentId, month, year)     → ایک student کی ایک مہینے میں ایک payment
SystemConfig.key                     → ہر config key unique
```

---

## 📊 INDEXES (اشاریے - Performance کے لیے)

```
User:
  ├─ email (UNIQUE INDEX)

Student:
  ├─ status
  ├─ balance
  ├─ name
  ├─ room
  └─ hall ⭐ NEW

Attendance:
  ├─ studentId
  ├─ date
  ├─ status
  └─ (studentId, date) UNIQUE

Payment:
  ├─ studentId
  ├─ (month, year)
  ├─ status
  └─ (studentId, month, year) UNIQUE

Transaction:
  ├─ studentId
  ├─ date
  ├─ type
  └─ createdAt

Expense:
  ├─ date
  └─ category

SystemConfig:
  └─ key (UNIQUE)
```

---

## 🎯 DATA INTEGRITY RULES (ڈیٹا کی درستگی کے اصول)

### 1. Referential Integrity (حوالہ جاتی درستگی)
```
✅ Attendance.studentId must exist in Student.id
✅ Payment.studentId must exist in Student.id
✅ Transaction.studentId must exist in Student.id
```

### 2. Cascade Rules (زنجیری اصول)
```
✅ Delete Student → Delete all Attendance records
✅ Delete Student → Delete all Payment records
❌ Delete Student → Keep Transaction records (history)
```

### 3. Unique Constraints (منفرد پابندیاں)
```
✅ One attendance per student per day
✅ One payment per student per month
✅ One email per user
```

### 4. Default Values (طے شدہ قدریں)
```
✅ Student.status = ACTIVE
✅ Student.balance = 0
✅ Student.joinedAt = now()
✅ Attendance.cost = 0
✅ Payment.status = PENDING
```

---

## 💾 STORAGE ESTIMATES (ذخیرہ کا تخمینہ)

### Per Record Size (ہر ریکارڈ کا سائز):
```
User:         ~200 bytes
Student:      ~300 bytes
Attendance:   ~150 bytes
Payment:      ~200 bytes
Transaction:  ~250 bytes
Expense:      ~200 bytes
```

### For 100 Students (100 طلباء کے لیے):
```
Students:           100 × 300 bytes    = 30 KB
Attendance/day:     100 × 150 bytes    = 15 KB
Attendance/month:   15 KB × 30 days    = 450 KB
Attendance/year:    450 KB × 12 months = 5.4 MB
Payments/year:      100 × 200 × 12     = 240 KB
Transactions/year:  ~1000 × 250 bytes  = 250 KB
Expenses/year:      ~500 × 200 bytes   = 100 KB

Total/year:         ~6 MB
```

---

## 🔄 CRUD OPERATIONS (بنیادی عملیات)

### Create (بنانا):
```sql
-- Student بنانا
INSERT INTO students (id, name, phone, room, hall, balance)
VALUES ('abc123', 'علی خان', '03001234567', '101', 'FAISAL_HALL', 5000);

-- Attendance بنانا
INSERT INTO attendance (id, studentId, date, status, cost)
VALUES ('xyz789', 'abc123', '2026-05-10', 'PRESENT', 200);

-- Payment بنانا (with balance update)
BEGIN TRANSACTION;
  INSERT INTO payments (id, studentId, amount, month, year, status)
  VALUES ('pay123', 'abc123', 5000, 5, 2026, 'PAID');
  
  UPDATE students SET balance = balance + 5000 WHERE id = 'abc123';
  
  INSERT INTO transactions (id, studentId, amount, type, method)
  VALUES ('txn123', 'abc123', 5000, 'DEPOSIT', 'CASH');
COMMIT;
```

### Read (پڑھنا):
```sql
-- تمام ACTIVE students
SELECT * FROM students WHERE status = 'ACTIVE';

-- ایک student کی تمام حاضریاں
SELECT * FROM attendance WHERE studentId = 'abc123' ORDER BY date DESC;

-- ایک student کے تمام transactions
SELECT * FROM transactions WHERE studentId = 'abc123' ORDER BY date DESC;
```

### Update (تبدیل کرنا):
```sql
-- Student کا hall update کرنا
UPDATE students SET hall = 'ATIQUE_HALL' WHERE id = 'abc123';

-- Payment کی status update کرنا
UPDATE payments SET status = 'PAID', paidAt = NOW() WHERE id = 'pay123';
```

### Delete (مٹانا):
```sql
-- Student delete کرنا (cascade delete)
DELETE FROM students WHERE id = 'abc123';
-- یہ automatically delete کر دے گا:
--   - تمام attendance records
--   - تمام payment records
-- لیکن transactions محفوظ رہیں گے
```

---

## 🎨 ERD DIAGRAM FOR TOOLS

### For draw.io / Lucidchart:
```
1. Create 7 entities (rectangles):
   - User
   - Student (center, larger)
   - Attendance
   - Payment
   - Transaction
   - Expense
   - SystemConfig

2. Add relationships (lines):
   - User → Student (1:*)
   - Student → Attendance (1:*)
   - Student → Payment (1:*)
   - Student → Transaction (1:*)
   - Expense (standalone)

3. Mark primary keys with 🔑
4. Mark foreign keys with 🔗
5. Add cardinality (1, *)
```

### For dbdiagram.io:
```
Copy the Prisma schema from:
backend/prisma/schema.prisma

Paste into dbdiagram.io
It will auto-generate the ERD!
```

---

## ✅ ERD SUMMARY

```
📊 Total Entities: 7
   ├─ User (1)
   ├─ Student (1) ⭐ CENTRAL
   ├─ Attendance (*)
   ├─ Payment (*)
   ├─ Transaction (*)
   ├─ Expense (independent)
   └─ SystemConfig (1)

🔗 Total Relationships: 4
   ├─ User → Student (manages)
   ├─ Student → Attendance (has many)
   ├─ Student → Payment (has many)
   └─ Student → Transaction (has many)

🔑 Primary Keys: 7
🔗 Foreign Keys: 3
🔒 Unique Constraints: 5
📊 Indexes: 20+

💰 Single Source of Truth: Student.balance
🏢 Single Source of Truth: Student.hall
```

---

**یہ آپ کا مکمل ERD ہے! اب آپ کسی بھی tool میں diagram بنا سکتے ہیں۔**
