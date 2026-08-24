# Windows Fix - 500 Error

## آسان ترین طریقہ (Easiest Way)

### Option 1: Batch Script استعمال کریں

Terminal کھولیں اور چلائیں:

```cmd
cd Mess_Management_System\backend
fix-backend.bat
```

یہ script خودکار طور پر سب کچھ ٹھیک کر دے گی۔

---

### Option 2: Manual Commands (PowerShell)

**Terminal 1 - Backend:**

```powershell
cd Mess_Management_System\backend

# پرانی files صاف کریں
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force src\generated -ErrorAction SilentlyContinue

# Prisma install کریں
npm install @prisma/client

# Generate کریں
npx prisma generate

# Test کریں
node check-error.js

# Start کریں
npm run start:dev
```

**انتظار کریں یہ message آنے تک:**
```
🚀 Server running on http://localhost:3001/api/v1
```

**Terminal 2 - Frontend:**

```powershell
cd Mess_Management_System\frontend

# Cache صاف کریں
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start کریں
npm run dev
```

---

## Test کریں

### 1. Backend API Test
Browser میں کھولیں:
```
http://localhost:3001/api/v1/attendance/all-students?date=2026-05-10
```

**آپ کو students کا data دکھنا چاہیے (JSON format میں)**

### 2. Frontend Test
```
http://localhost:3000
```

1. Login کریں
2. "حاضری" پر کلک کریں
3. ✅ طلباء دکھنے چاہیے!

---

## اگر ابھی بھی 500 Error آئے

### Check 1: Backend Terminal
Backend terminal میں دیکھیں کیا error لکھا ہے۔

### Check 2: Database Test
```cmd
cd backend
node check-error.js
```

یہ بتائے گا کہ database connection ٹھیک ہے یا نہیں۔

### Check 3: Database Browser
```cmd
cd backend
npx prisma studio
```

یہ database browser کھولے گا - check کریں:
- Students table موجود ہے؟
- Attendance table موجود ہے؟

---

## Common Errors

### Error: "Cannot find module @prisma/client"
**حل:**
```cmd
cd backend
npm install @prisma/client
npx prisma generate
```

### Error: "Table attendance does not exist"
**حل:**
```cmd
cd backend
npx prisma migrate dev
```

### Error: "PrismaClientValidationError"
**حل:**
```cmd
cd backend
Remove-Item -Recurse -Force node_modules\.prisma
npx prisma generate
```

---

## Emergency Reset

اگر کچھ بھی کام نہ کرے:

```powershell
cd Mess_Management_System\backend

# سب کچھ delete
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force src\generated

# دوبارہ install
npm install

# Prisma setup
npx prisma generate

# Start
npm run start:dev
```

---

## یاد رکھیں

✅ PowerShell میں `rm -rf` کام نہیں کرتا
✅ `Remove-Item -Recurse -Force` استعمال کریں
✅ یا `.bat` script استعمال کریں (سب سے آسان)

---

## Quick Commands

**Batch script (آسان ترین):**
```cmd
cd backend
fix-backend.bat
```

**PowerShell script:**
```powershell
cd Mess_Management_System
.\fix-backend.ps1
```

**Manual PowerShell:**
دیکھیں Option 2 اوپر

---

**ابھی شروع کریں!** 🚀

Batch script استعمال کریں - سب سے آسان!
