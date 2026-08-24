# 🏗️ System Architecture

## 📊 High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Admin/Munshi)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Browser (http://localhost:3000)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    FRONTEND                                  │
│                   (Next.js 14)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages:                                               │  │
│  │  • Login                                              │  │
│  │  • Dashboard                                          │  │
│  │  • Members (Students)                                 │  │
│  │  • Attendance (حاضری) ← NEW TABLE VIEW               │  │
│  │  • Payments                                           │  │
│  │  • Expenses                                           │  │
│  │  • Reports                                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ (http://localhost:3001/api/v1)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND                                   │
│                   (NestJS)                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Modules:                                             │  │
│  │  • AuthModule (JWT)                                   │  │
│  │  • UsersModule                                        │  │
│  │  • StudentsModule                                     │  │
│  │  • AttendanceModule ← SIMPLIFIED                     │  │
│  │  • PaymentsModule                                     │  │
│  │  • ExpensesModule                                     │  │
│  │  • TransactionsModule                                 │  │
│  │  • DashboardModule                                    │  │
│  │  • ReportsModule                                      │  │
│  │  • ❌ MealsModule (REMOVED)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE                                   │
│                  (PostgreSQL)                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  • users                                              │  │
│  │  • students                                           │  │
│  │  • attendance ← SIMPLIFIED (no meal type)            │  │
│  │  • payments                                           │  │
│  │  • expenses                                           │  │
│  │  • transactions                                       │  │
│  │  • ❌ meals (REMOVED)                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Attendance Flow (New System)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Opens Attendance Page                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: System Fetches All ACTIVE Students                 │
│  API: GET /attendance/all-students?date=2026-05-10          │
│  • Gets all students with status='ACTIVE'                   │
│  • Checks if attendance exists for selected date            │
│  • If exists: shows saved status                            │
│  • If not exists: defaults to PRESENT                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Display Students in Table                          │
│  ┌───┬──────────┬──────┬─────────┬──────────────────────┐  │
│  │ # │ Name     │ Room │ Balance │ Status Buttons       │  │
│  ├───┼──────────┼──────┼─────────┼──────────────────────┤  │
│  │ 1 │ Ahmad    │ 101  │ Rs.1000 │ [حاضر][غیر][رخصت]  │  │
│  │ 2 │ Ali      │ 102  │ Rs.500  │ [حاضر][غیر][رخصت]  │  │
│  │ 3 │ Hassan   │ 103  │ Rs.800  │ [حاضر][غیر][رخصت]  │  │
│  └───┴──────────┴──────┴─────────┴──────────────────────┘  │
│  • All students default to PRESENT (green button active)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Admin Marks Attendance                             │
│  • Clicks "غیر حاضر" (Absent) for Ahmad                    │
│  • Clicks "رخصت" (Leave) for Ali                           │
│  • Hassan remains PRESENT (no action needed)                │
│  • Changed rows highlight in amber                          │
│  • "تبدیل شدہ" badge appears                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Admin Clicks "محفوظ کریں" (Save)                  │
│  API: POST /attendance/save-all                             │
│  Body: {                                                     │
│    attendances: [                                            │
│      { studentId: "1", date: "2026-05-10",                  │
│        status: "ABSENT", cost: 100 },                       │
│      { studentId: "2", date: "2026-05-10",                  │
│        status: "LEAVE", cost: 100 }                         │
│    ]                                                         │
│  }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Backend Processes Each Attendance                  │
│  For Ahmad (ABSENT):                                         │
│    • Create/Update attendance record                         │
│    • Deduct Rs.100 from balance (1000 → 900)               │
│    • Create transaction record (MEAL_CHARGE)                │
│  For Ali (LEAVE):                                            │
│    • Create/Update attendance record                         │
│    • NO deduction (balance stays 500)                       │
│    • NO transaction created                                  │
│  For Hassan (PRESENT - not in request):                     │
│    • No action (remains PRESENT by default)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Success Response                                    │
│  { success: 2, failed: 0, errors: [] }                      │
│  • Frontend shows success toast                             │
│  • Refreshes data                                            │
│  • Updated balances displayed                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Simplified)

### Before (Old System)
```
students ──┬── meals (breakfast/lunch/dinner)
           ├── payments
           ├── attendance (with meal type)
           └── transactions

❌ Complex: Multiple meal records per day
❌ Confusing: Meal type in attendance
❌ Slow: No indexes
```

### After (New System)
```
students ──┬── attendance (single per day) ✅
           ├── payments
           └── transactions

✅ Simple: One attendance per day
✅ Clear: Just PRESENT/ABSENT/LEAVE
✅ Fast: 20+ indexes added
```

---

## 📋 Attendance Table Structure

```sql
CREATE TABLE attendance (
  id          UUID PRIMARY KEY,
  studentId   TEXT NOT NULL,
  date        DATE NOT NULL,
  status      TEXT NOT NULL,  -- 'PRESENT' | 'ABSENT' | 'LEAVE'
  cost        FLOAT DEFAULT 0,
  createdAt   TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(studentId, date),  -- One attendance per student per day
  
  -- Indexes for performance
  INDEX idx_attendance_studentId,
  INDEX idx_attendance_date,
  INDEX idx_attendance_status
);
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User enters email & password                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. POST /auth/login                                         │
│     • Validates credentials                                  │
│     • Checks user exists                                     │
│     • Verifies password (bcrypt)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Generate JWT Token                                       │
│     • Payload: { userId, email, role }                      │
│     • Secret: JWT_SECRET from .env                          │
│     • Expires: 7 days                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Return Token to Frontend                                 │
│     { access_token: "eyJhbGc...", user: {...} }             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Frontend Stores Token                                    │
│     • localStorage.setItem('token', token)                  │
│     • Sets Authorization header for future requests         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. All Future Requests Include Token                        │
│     Authorization: Bearer eyJhbGc...                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Request/Response Flow

### Example: Get All Students with Attendance

```
Frontend                    Backend                     Database
   │                           │                            │
   │  GET /attendance/         │                            │
   │  all-students?date=...    │                            │
   ├──────────────────────────>│                            │
   │                           │                            │
   │                           │  Verify JWT Token          │
   │                           │  (JwtAuthGuard)            │
   │                           │                            │
   │                           │  SELECT * FROM students    │
   │                           │  WHERE status='ACTIVE'     │
   │                           ├───────────────────────────>│
   │                           │                            │
   │                           │  [students data]           │
   │                           │<───────────────────────────┤
   │                           │                            │
   │                           │  SELECT * FROM attendance  │
   │                           │  WHERE date='2026-05-10'   │
   │                           ├───────────────────────────>│
   │                           │                            │
   │                           │  [attendance data]         │
   │                           │<───────────────────────────┤
   │                           │                            │
   │                           │  Merge data:               │
   │                           │  - Match attendance to     │
   │                           │    students                │
   │                           │  - Default to PRESENT      │
   │                           │    if no attendance        │
   │                           │                            │
   │  [merged data]            │                            │
   │<──────────────────────────┤                            │
   │                           │                            │
   │  Display in table         │                            │
   │                           │                            │
```

---

## 🎨 Frontend Component Structure

```
attendance/page.tsx
│
├── State Management
│   ├── students (all students)
│   ├── filteredStudents (after search)
│   ├── loading (loading state)
│   ├── submitting (saving state)
│   ├── date (selected date)
│   ├── dailyCharge (charge amount)
│   ├── searchQuery (search text)
│   └── changedStudents (Set of changed IDs)
│
├── Effects
│   ├── useEffect(() => fetchData(), [date])
│   └── useEffect(() => filterStudents(), [searchQuery, students])
│
├── Functions
│   ├── fetchData() - Get students with attendance
│   ├── setStatus() - Change student status
│   ├── handleSave() - Save all changes
│   └── getStatusCounts() - Calculate stats
│
└── UI Components
    ├── Header (title + save button)
    ├── Stats Cards (total, present, absent, leave)
    ├── Filters (date, charge, search)
    ├── Instructions Box
    └── Students Table
        └── For each student:
            ├── Row number
            ├── Name
            ├── Room
            ├── Balance
            └── Status Buttons (حاضر/غیر حاضر/رخصت)
```

---

## ⚡ Performance Optimizations

### Database Level
```
✅ Indexes on:
   • students.status
   • students.balance
   • students.name
   • students.room
   • attendance.studentId
   • attendance.date
   • attendance.status
   • payments.studentId
   • payments.month
   • payments.year
   • expenses.date
   • expenses.category
   • transactions.studentId
   • transactions.date
   • transactions.type
```

### Backend Level
```
✅ Batch Processing:
   • Process 10 attendances at a time
   • Use Promise.allSettled for parallel processing
   • Reduce database round trips

✅ Optimized Queries:
   • Use groupBy instead of findMany + reduce
   • Select only needed fields
   • Use includes wisely
```

### Frontend Level
```
✅ React Optimizations:
   • Use Set for changedStudents (O(1) lookup)
   • Debounce search input
   • Memoize expensive calculations
   • Lazy load components
```

---

## 🔄 Data Flow Summary

```
User Action → Frontend State → API Call → Backend Service
    ↓              ↓              ↓              ↓
UI Update ← Response ← Database ← Prisma ORM
```

---

## 📦 Module Dependencies

```
AppModule
├── ConfigModule (global)
├── PrismaModule (shared)
├── AuthModule
│   └── UsersModule
├── StudentsModule
│   └── PrismaModule ✅
├── AttendanceModule
│   └── PrismaModule ✅
├── PaymentsModule
│   └── PrismaModule ✅
├── ExpensesModule
│   └── PrismaModule ✅
├── TransactionsModule
│   └── PrismaModule ✅
├── DashboardModule
│   └── PrismaModule ✅
└── ReportsModule
    └── PrismaModule ✅
```

---

## 🎯 Key Design Decisions

### 1. Single Attendance Per Day
**Why?** Simplifies logic, reduces complexity, easier to understand

### 2. Default to PRESENT
**Why?** Most students are present, admin only marks exceptions

### 3. LEAVE = No Charge
**Why?** Fair policy, students on leave shouldn't be charged

### 4. Table View
**Why?** See all students at once, faster marking, better UX

### 5. Batch Save
**Why?** Allows multiple changes before committing, better UX

### 6. Indexes Everywhere
**Why?** Fast queries, better performance, scalable

---

**Last Updated**: May 10, 2026  
**Version**: 2.0.0  
**Status**: Production Ready ✅
