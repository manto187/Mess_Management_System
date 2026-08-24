# 🔧 Fix Prisma Permission Error (Windows)

## Error
```
Error: EPERM: operation not permitted, rename 
'...\node_modules\.prisma\client\query_engine-windows.dll.node.tmp36936' 
-> '...\node_modules\.prisma\client\query_engine-windows.dll.node'
```

## Cause
Prisma query engine file is locked by another process (probably old backend process).

---

## ✅ SOLUTION

### Step 1: Close All Node Processes
```powershell
# Open PowerShell as Administrator
# Run this command:
taskkill /F /IM node.exe
```

**Or manually:**
1. Press `Ctrl+Shift+Esc` (Task Manager)
2. Find all "Node.js" processes
3. Right-click → End Task (for each one)

---

### Step 2: Delete Prisma Cache
```bash
cd Mess_Management_System/backend
rm -rf node_modules/.prisma
```

**Or manually:**
1. Go to: `backend/node_modules/.prisma`
2. Delete the entire `.prisma` folder

---

### Step 3: Generate Prisma Client Again
```bash
cd Mess_Management_System/backend
npm run prisma:generate
```

Should show:
```
✔ Generated Prisma Client
```

---

### Step 4: Start Backend
```bash
npm run start:dev
```

Should show:
```
🚀 Server running on http://localhost:3001/api/v1
```

---

## 🎯 Quick Fix (One Command)

```bash
cd Mess_Management_System/backend
taskkill /F /IM node.exe & timeout /t 2 & rmdir /s /q node_modules\.prisma & npm run prisma:generate & npm run start:dev
```

---

## ✅ Success!
Backend should now start without errors.
