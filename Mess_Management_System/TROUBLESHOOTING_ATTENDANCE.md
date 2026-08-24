# 🔧 Troubleshooting - Students Not Showing in Attendance

## Problem
Students are added in the system but not showing on the attendance page.

---

## ✅ Step-by-Step Fix

### Step 1: Check Backend is Running
```bash
# Open backend terminal
cd Mess_Management_System/backend

# Check if running
# You should see: 🚀 Server running on http://localhost:3001/api/v1
```

**If NOT running:**
```bash
npm run start:dev
```

---

### Step 2: Apply Database Migration
The schema has been updated but database needs migration.

```bash
cd Mess_Management_System/backend

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

---

### Step 3: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
npm run start:dev
```

---

### Step 4: Check Frontend Console
1. Open browser (http://localhost:3000)
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Go to Attendance page
5. Check for errors

**Common Errors:**

#### Error 1: "404 Not Found"
```
GET http://localhost:3001/api/v1/attendance/all-students?date=... 404
```
**Fix:** Backend endpoint not registered. Restart backend.

#### Error 2: "401 Unauthorized"
```
GET http://localhost:3001/api/v1/attendance/all-students?date=... 401
```
**Fix:** Login again. Token expired.

#### Error 3: "Network Error"
```
Network Error
```
**Fix:** Backend not running. Start backend.

---

### Step 5: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh attendance page
4. Look for request: `all-students?date=...`

**Check Response:**
- Status should be: `200 OK`
- Response should have array of students

**If Empty Array `[]`:**
- No ACTIVE students in database
- Check students page
- Make sure students have status = ACTIVE

---

### Step 6: Verify Students are ACTIVE
```bash
# Open Prisma Studio
cd backend
npx prisma studio
```

1. Open `Student` table
2. Check `status` column
3. Should be `ACTIVE` (not `ARCHIVED`)

**If students are ARCHIVED:**
- Go to Students page in frontend
- Click "ایکٹو کریں" button

---

### Step 7: Test API Directly

#### Test 1: Get Students
Open browser and go to:
```
http://localhost:3000/students
```
Should show list of students.

#### Test 2: Check Browser Console
On attendance page, open console and type:
```javascript
fetch('http://localhost:3001/api/v1/attendance/all-students?date=2026-05-10', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('mess_token')
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

Should show array of students with attendance.

---

## 🎯 Quick Fix Commands

Run these in order:

```bash
# 1. Backend - Apply migration
cd Mess_Management_System/backend
npm run prisma:generate
npm run prisma:push

# 2. Restart backend
# Press Ctrl+C to stop
npm run start:dev

# 3. Frontend - Clear cache
cd ../frontend
rm -rf .next
npm run dev

# 4. Browser - Hard refresh
# Press Ctrl+Shift+R
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "کوئی رجسٹرڈ طالب علم نہیں ہے"
**Cause:** No students in database OR all students are ARCHIVED

**Fix:**
1. Go to Students page
2. Add new students OR
3. Activate archived students

---

### Issue 2: Students show on Students page but not on Attendance
**Cause:** API endpoint not working OR authentication issue

**Fix:**
1. Check browser console for errors
2. Check Network tab for failed requests
3. Logout and login again
4. Restart backend

---

### Issue 3: "Loading..." forever
**Cause:** API request hanging OR backend not responding

**Fix:**
1. Check backend is running
2. Check backend logs for errors
3. Restart backend
4. Clear browser cache

---

### Issue 4: Database migration failed
**Error:**
```
Error: P3018
Migration failed to apply cleanly to the shadow database
```

**Fix:**
```bash
cd backend
npx prisma migrate reset
npm run prisma:push
```

**⚠️ WARNING:** This will delete all data!

**Better Fix (Keep Data):**
```bash
# Backup first
pg_dump -U postgres messdb > backup.sql

# Then reset
npx prisma migrate reset
npm run prisma:push

# Restore if needed
psql -U postgres messdb < backup.sql
```

---

## 📊 Verification Checklist

After applying fixes, verify:

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can login successfully
- [ ] Students page shows students
- [ ] Attendance page shows students
- [ ] Can mark attendance
- [ ] Can save attendance
- [ ] Balance updates correctly

---

## 🆘 Still Not Working?

### Check Backend Logs
Look for errors in backend terminal:
```
[Nest] ERROR [ExceptionsHandler] ...
```

### Check Database Connection
```bash
cd backend
npx prisma studio
```
Should open database viewer.

### Check Environment Variables
```bash
cd backend
cat .env
```

Should have:
```
DATABASE_URL="postgresql://postgres:manahil123@localhost:5432/messdb"
JWT_SECRET="mess_secret_123"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

---

## 🎉 Success Indicators

When everything is working:

1. ✅ Backend shows: `🚀 Server running on http://localhost:3001/api/v1`
2. ✅ Frontend shows: `▲ Next.js 16.2.6 - Local: http://localhost:3000`
3. ✅ Attendance page shows table with students
4. ✅ Can click status buttons
5. ✅ Can save attendance
6. ✅ No errors in console

---

## 📞 Debug Commands

```bash
# Check if backend is running
curl http://localhost:3001/api/v1/students

# Check database
cd backend
npx prisma studio

# Check logs
cd backend
npm run start:dev
# Watch for errors

# Clear everything and restart
cd backend
rm -rf node_modules/.prisma
npm run prisma:generate
npm run start:dev
```

---

**Follow these steps and your attendance page will show students!** 🎯
