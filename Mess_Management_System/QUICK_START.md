# ⚡ Quick Start Guide

## 🚀 Start in 2 Steps

### Step 1: Start Backend
```bash
cd Mess_Management_System/backend
rm -rf dist node_modules/.prisma src/generated
npm run prisma:generate
npm run start:dev
```

### Step 2: Start Frontend (New Terminal)
```bash
cd Mess_Management_System/frontend
npm run dev
```

---

## 🌐 Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1

---

## ✅ Quick Test

1. Login at http://localhost:3000
2. Click "ممبرز" (Members) - Should see students
3. Click "حاضری" (Attendance) - Should see same students
4. Mark someone "غیر حاضر" (Absent)
5. Click "محفوظ کریں" (Save)
6. ✅ Done!

---

## 🆘 Quick Fix

If anything breaks:

```bash
# Backend
cd backend
rm -rf dist node_modules/.prisma src/generated
npm run prisma:generate
npm run start:dev

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## 📖 Full Documentation

- **English**: `SYSTEM_RESTART_GUIDE.md`
- **Urdu**: `URDU_GUIDE.md`
- **Technical**: `FINAL_STATUS.md`

---

**That's it! You're ready to go!** 🎉
