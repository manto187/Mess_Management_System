# 500 Error کا حل - فوری

## مسئلہ
Backend 500 error دے رہا ہے جب attendance data fetch کر رہے ہیں۔

## میں نے کیا ٹھیک کیا
AttendanceStatus enum کا import issue fix کر دیا۔

---

## اب آپ یہ کریں (5 منٹ)

### Step 1: Backend بند کریں
Backend terminal میں `Ctrl+C` دبائیں

### Step 2: مکمل صفائی

```bash
cd Mess_Management_System/backend

# سب کچھ صاف کریں
rm -rf dist
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
rm -rf src/generated

# Prisma دوبارہ install
npm install @prisma/client

# Generate کریں
npx prisma generate

# Test کریں
node check-error.js
```

**check-error.js کی output میں یہ دکھنا چاہیے:**
```
✅ Found X students
✅ Found X attendance records
✅ Query works!
```

**اگر error آئے:**
- "Table attendance does not exist" → چلائیں: `npx prisma migrate dev`
- کوئی اور error → نیچے دیکھیں

### Step 3: Backend شروع کریں

```bash
npm run start:dev
```

**انتظار کریں:**
```
✅ Nest application successfully started
✅ 🚀 Server running on http://localhost:3001/api/v1
```

### Step 4: API Test کریں

Browser میں کھولیں:
```
http://localhost:3001/api/v1/attendance/all-students?date=2026-05-10
```

**آپ کو students کا data JSON میں دکھنا چاہیے۔**

**اگر 500 error آئے:**
- Backend terminal دیکھیں - کیا error لکھا ہے؟
- `node check-error.js` چلائیں

### Step 5: Frontend شروع کریں

```bash
cd Mess_Management_System/frontend
rm -rf .next
npm run dev
```

### Step 6: Test کریں

1. http://localhost:3000 کھولیں
2. Login کریں
3. "حاضری" پر جائیں
4. ✅ طلباء دکھنے چاہیے!

---

## اگر ابھی بھی 500 Error آئے

### Option 1: Backend Terminal دیکھیں
جب error آئے تو backend terminal میں actual error دیکھیں۔

عام errors:
- `PrismaClientValidationError` → Step 2 دوبارہ چلائیں
- `Table does not exist` → Migration چاہیے
- `Column does not exist` → Schema mismatch ہے

### Option 2: Database Check کریں

```bash
cd backend
npx prisma studio
```

Check کریں:
1. `attendance` table موجود ہے؟
2. `students` table میں ACTIVE students ہیں؟

### Option 3: Migration چلائیں

```bash
cd backend
npx prisma migrate dev --name fix_attendance
```

### Option 4: سب کچھ Reset (آخری حل)

⚠️ **خبردار: یہ تمام data delete کر دے گا!**

```bash
cd backend
npx prisma migrate reset --force
npx prisma generate
npm run prisma:seed
npm run start:dev
```

---

## Quick Test Commands

**Database test:**
```bash
cd backend
node check-error.js
```

**API test:**
```
http://localhost:3001/api/v1/attendance/all-students?date=2026-05-10
```

**Database browser:**
```bash
cd backend
npx prisma studio
```

---

## میں نے کیا تبدیل کیا

File: `backend/src/attendance/dto/attendance.dto.ts`

پہلے:
```typescript
import { AttendanceStatus } from '@prisma/client';
```

اب:
```typescript
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}
```

یہ Prisma import issue fix کرتا ہے۔

---

## ابھی کریں

1. Backend بند کریں (Ctrl+C)
2. Step 2 چلائیں (صفائی اور generate)
3. `node check-error.js` چلائیں
4. Backend شروع کریں
5. API test کریں
6. Frontend شروع کریں

---

**اگر مسئلہ حل نہ ہو تو یہ بھیجیں:**
1. Backend terminal کی output (جب error آئے)
2. `node check-error.js` کی output
3. Browser console کی error

**ابھی شروع کریں! 🚀**
