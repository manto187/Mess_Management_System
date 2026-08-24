# 🧪 BALANCE SYNCHRONIZATION - Testing Guide

## Quick Test (5 Minutes)

### Prerequisites
- Backend running on port 3001
- Frontend running on port 3000
- At least one ACTIVE student in database

---

## TEST 1: Add Deposit from Payments Page

### Steps:

1. **Open Payments Page**
   ```
   http://localhost:3000/payments
   ```

2. **Note Current Balance**
   - Go to Members page
   - Find a student (e.g., "Ahmad")
   - Note current balance (e.g., Rs. 1000)

3. **Add Deposit**
   - Go back to Payments page
   - Click "ادائیگی ریکارڈ" (Add Payment)
   - Select student: Ahmad
   - Enter amount: 5000
   - Select month: Current month
   - Select year: Current year
   - Select method: CASH
   - Status: PAID (default)
   - Click "محفوظ کریں" (Save)

4. **Verify Success**
   - ✅ Success toast appears: "ادائیگی ریکارڈ ہو گیا ✓"
   - ✅ Toast says: "بیلنس اپ ڈیٹ ہو گیا"
   - ✅ Payment appears in list

5. **Check Members Page**
   - Go to Members page
   - Find Ahmad
   - ✅ Balance should be: 1000 + 5000 = **6000**

6. **Check Attendance Page**
   - Go to Attendance page
   - Find Ahmad in table
   - ✅ Balance should show: **6000**

7. **Check Student Profile**
   - Go to Members page
   - Click on Ahmad's name
   - ✅ Balance at top should show: **6000**
   - ✅ Transaction history should show new deposit entry
   - ✅ "کل ڈیپازٹ" (Total Deposits) should include 5000

8. **Check Backend Logs**
   ```
   Backend terminal should show:
   💰 Creating payment for student abc123: Rs.5000
   ✅ Payment record created: pay_xyz789
   ✅ Student balance updated: 1000 → 6000
   ✅ Transaction created: txn_def456
   ```

### Expected Result:
✅ Balance updated everywhere immediately  
✅ No manual refresh needed  
✅ Transaction created  
✅ All pages show same balance

---

## TEST 2: Mark Pending Payment as Paid

### Steps:

1. **Create Pending Payment**
   - Go to Payments page
   - Add payment with Status: PENDING
   - Amount: 3000
   - Note current balance (e.g., 6000)

2. **Mark as Paid**
   - Find the pending payment in list
   - Click "ادا" (Mark as Paid) button
   - ✅ Status changes to "ادا شدہ" (PAID)

3. **Verify Balance Updated**
   - Go to Members page
   - ✅ Balance should be: 6000 + 3000 = **9000**

4. **Check Transaction Created**
   - Go to student profile
   - ✅ New transaction entry should appear

### Expected Result:
✅ Balance updated when marked as paid  
✅ Transaction created automatically

---

## TEST 3: Add Deposit from Student Profile

### Steps:

1. **Open Student Profile**
   - Go to Members page
   - Click on a student
   - Note current balance (e.g., 9000)

2. **Add Deposit**
   - Click "رقم جمع کریں" (Add Money) button
   - Enter amount: 2000
   - Select method: EASYPAISA
   - Enter description: "Test deposit"
   - Click "محفوظ کریں" (Save)

3. **Verify Immediate Update**
   - ✅ Balance at top updates immediately: **11000**
   - ✅ New transaction appears in history
   - ✅ "کل ڈیپازٹ" increases by 2000

4. **Verify Other Pages**
   - Go to Members page
   - ✅ Balance shows: **11000**
   - Go to Attendance page
   - ✅ Balance shows: **11000**
   - Go to Payments page
   - ✅ No new payment record (this was direct deposit)

### Expected Result:
✅ Balance updated immediately  
✅ Transaction created  
✅ Consistent across all pages

---

## TEST 4: Attendance Deduction

### Steps:

1. **Note Current Balance**
   - Go to Members page
   - Note student balance (e.g., 11000)

2. **Mark Absent**
   - Go to Attendance page
   - Select today's date
   - Find student
   - Click "غیر حاضر" (Absent) button
   - Daily charge: 100 (default)
   - Click "محفوظ کریں" (Save)

3. **Verify Deduction**
   - ✅ Success message appears
   - Go to Members page
   - ✅ Balance should be: 11000 - 100 = **10900**

4. **Check Transaction**
   - Go to student profile
   - ✅ New transaction: "Daily Absent (2026-05-10)"
   - ✅ Amount: -100

### Expected Result:
✅ Balance decreased by daily charge  
✅ Transaction created  
✅ Consistent across all pages

---

## TEST 5: Delete Payment (Balance Reversal)

### Steps:

1. **Note Current Balance**
   - Go to Members page
   - Note balance (e.g., 10900)

2. **Delete a PAID Payment**
   - Go to Payments page
   - Find a PAID payment (e.g., 5000)
   - Delete it (if delete button exists)

3. **Verify Balance Reversed**
   - Go to Members page
   - ✅ Balance should be: 10900 - 5000 = **5900**

4. **Check Refund Transaction**
   - Go to student profile
   - ✅ New transaction: "Payment deleted - balance reversed"
   - ✅ Type: REFUND
   - ✅ Amount: +5000 (but balance decreased)

### Expected Result:
✅ Balance automatically corrected  
✅ Refund transaction created  
✅ Audit trail maintained

---

## TEST 6: Multiple Operations

### Steps:

1. **Start Balance**: 5900

2. **Add Deposit**: +3000
   - ✅ Balance: 8900

3. **Mark Absent**: -100
   - ✅ Balance: 8800

4. **Add Another Deposit**: +2000
   - ✅ Balance: 10800

5. **Mark Leave**: -0 (no charge)
   - ✅ Balance: 10800 (unchanged)

6. **Verify All Pages**
   - Members page: ✅ 10800
   - Attendance page: ✅ 10800
   - Student profile: ✅ 10800
   - Transaction history: ✅ All 4 transactions listed

### Expected Result:
✅ All operations reflected correctly  
✅ Balance consistent everywhere  
✅ Complete transaction history

---

## 🔍 DEBUGGING CHECKLIST

### If Balance Not Updating:

1. **Check Backend Logs**
   ```
   Look for:
   💰 Creating payment...
   ✅ Payment record created...
   ✅ Student balance updated...
   ✅ Transaction created...
   
   If missing → Backend issue
   ```

2. **Check Browser Console**
   ```
   F12 → Console
   Look for errors
   ```

3. **Check Network Tab**
   ```
   F12 → Network
   Find POST /payments request
   Check response:
   - Status: 200
   - Response has updated balance
   ```

4. **Check Database**
   ```powershell
   cd backend
   npx prisma studio
   
   Check:
   - students table → balance column
   - transactions table → new entry
   - payments table → new entry
   ```

5. **Hard Refresh**
   ```
   Ctrl+F5 (clear cache and reload)
   ```

---

## 🎯 SUCCESS CRITERIA

All tests pass if:

- ✅ Balance updates immediately after deposit
- ✅ Balance visible in Members page
- ✅ Balance visible in Attendance page
- ✅ Balance visible in Student profile
- ✅ Transaction created for each operation
- ✅ No manual refresh needed
- ✅ Backend logs show updates
- ✅ Database reflects changes
- ✅ All pages show same balance

---

## 📊 EXPECTED BACKEND LOGS

```
[PaymentsService] 💰 Creating payment for student clxxx: Rs.5000
[PaymentsService] ✅ Payment record created: clyyy
[PaymentsService] ✅ Student balance updated: 1000 → 6000
[PaymentsService] ✅ Transaction created: clzzz
[HTTP] POST /api/v1/payments 201 - 45ms
```

---

## 🚨 COMMON ISSUES

### Issue 1: Balance shows old value

**Solution**:
- Hard refresh (Ctrl+F5)
- Check if backend restarted
- Check if Prisma client regenerated

### Issue 2: Transaction not created

**Solution**:
- Check backend logs for errors
- Verify payment status is 'PAID'
- Check database transactions table

### Issue 3: Backend error

**Solution**:
```powershell
cd backend
npx prisma generate
npm run start:dev
```

---

## ✅ FINAL VERIFICATION

After all tests:

1. [ ] Deposits update balance ✅
2. [ ] Attendance deductions update balance ✅
3. [ ] All pages show same balance ✅
4. [ ] Transactions created for all operations ✅
5. [ ] Backend logs show updates ✅
6. [ ] Database reflects changes ✅
7. [ ] No errors in console ✅
8. [ ] No errors in backend ✅

**If all checked**: ✅ **SYSTEM WORKING PERFECTLY!**

---

**Testing Time**: ~5-10 minutes  
**Status**: Ready to Test ✅
