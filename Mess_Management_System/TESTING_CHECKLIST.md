# Testing Checklist - Bulk Attendance & Meal Quantity Features

## 🧪 Manual Testing Guide

### Pre-Testing Setup
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Database connected and accessible
- [ ] At least 10 test students in database
- [ ] Browser console open (F12)
- [ ] Network tab open to monitor API calls

---

## ✅ FEATURE 1: Bulk Actions Testing

### Test 1.1: Mark All Present
**Steps:**
1. Navigate to Attendance page
2. Click "سب حاضر" (Mark All Present) button
3. Confirm the dialog
4. Wait for operation to complete

**Expected Results:**
- [ ] Confirmation dialog appears with correct message
- [ ] Loading spinner shows during operation
- [ ] Success toast: "X طلباء کی حاضری محفوظ ہو گئی"
- [ ] All students show green "حاضر" button as active
- [ ] Stats card shows correct count
- [ ] API call to `/attendance/bulk-action` succeeds
- [ ] No console errors

**Test Data:**
- Date: Today's date
- Expected students: All registered students
- Expected status: PRESENT

---

### Test 1.2: Mark All Absent
**Steps:**
1. Navigate to Attendance page
2. Click "سب غیر حاضر" (Mark All Absent) button
3. Confirm the dialog
4. Wait for operation to complete

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] All students show red "غیر حاضر" button as active
- [ ] Stats card: Absent count = Total students
- [ ] Balance deducted for all students
- [ ] API call succeeds
- [ ] No errors

---

### Test 1.3: Mark All Leave
**Steps:**
1. Navigate to Attendance page
2. Click "سب رخصت" (Mark All Leave) button
3. Confirm the dialog
4. Wait for operation to complete

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] All students show blue "رخصت" button as active
- [ ] Stats card: Leave count = Total students
- [ ] NO balance deduction (leave is free)
- [ ] API call succeeds
- [ ] No errors

---

### Test 1.4: Mark Selected Only
**Steps:**
1. Navigate to Attendance page
2. Check 3-5 student checkboxes
3. Verify badge shows correct count (e.g., "3 منتخب")
4. Click "صرف منتخب" (Mark Selected Only) button
5. Confirm the dialog
6. Wait for operation to complete

**Expected Results:**
- [ ] Selected students highlighted in purple
- [ ] Badge shows correct count
- [ ] Confirmation dialog shows count
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Selected students marked as ABSENT
- [ ] Non-selected students marked as PRESENT
- [ ] Checkboxes cleared after operation
- [ ] Stats card shows correct counts
- [ ] API call succeeds
- [ ] No errors

---

### Test 1.5: Select All Checkbox
**Steps:**
1. Navigate to Attendance page
2. Click "Select All" checkbox in table header
3. Verify all students selected
4. Click "Select All" again to deselect
5. Verify all students deselected

**Expected Results:**
- [ ] First click: All checkboxes checked
- [ ] All rows highlighted in purple
- [ ] Badge shows total count
- [ ] Second click: All checkboxes unchecked
- [ ] Purple highlight removed
- [ ] Badge disappears
- [ ] No API calls (client-side only)

---

### Test 1.6: Cancel Bulk Action
**Steps:**
1. Click any bulk action button
2. Click "Cancel" in confirmation dialog

**Expected Results:**
- [ ] Dialog closes
- [ ] No API call made
- [ ] No changes to attendance
- [ ] No toast notification
- [ ] UI remains unchanged

---

### Test 1.7: Bulk Action Error Handling
**Steps:**
1. Stop backend server
2. Try any bulk action
3. Confirm dialog

**Expected Results:**
- [ ] Error toast appears
- [ ] Error message is descriptive
- [ ] Loading state ends
- [ ] UI remains functional
- [ ] No crash or freeze

---

## ✅ FEATURE 2: Meal Quantity Testing

### Test 2.1: Single Meal (Default)
**Steps:**
1. Navigate to Attendance page
2. Find a student row
3. Verify meal quantity shows "1"
4. Mark student as PRESENT
5. Click "محفوظ کریں" (Save)

**Expected Results:**
- [ ] Default value is 1
- [ ] No multiplier indicator shown
- [ ] Cost = Daily Charge × 1
- [ ] Balance deducted correctly
- [ ] API call includes mealQuantity: 1
- [ ] Success toast appears
- [ ] No errors

**Test Data:**
- Daily Charge: Rs. 100
- Meal Quantity: 1
- Expected Cost: Rs. 100

---

### Test 2.2: Multiple Meals (2-10)
**Steps:**
1. Navigate to Attendance page
2. Find a student row
3. Change meal quantity to 2
4. Verify multiplier shows "(2x)"
5. Mark student as PRESENT
6. Click "محفوظ کریں" (Save)
7. Repeat for quantities 3, 5, 10

**Expected Results:**
- [ ] Input accepts values 2-10
- [ ] Multiplier indicator shows correctly (2x, 3x, etc.)
- [ ] Row highlights in amber (changed)
- [ ] Cost = Daily Charge × Meal Quantity
- [ ] Balance deducted correctly
- [ ] API call includes correct mealQuantity
- [ ] Success toast appears
- [ ] No errors

**Test Data:**
| Meal Qty | Daily Charge | Expected Cost |
|----------|--------------|---------------|
| 2        | Rs. 100      | Rs. 200       |
| 3        | Rs. 100      | Rs. 300       |
| 5        | Rs. 100      | Rs. 500       |
| 10       | Rs. 100      | Rs. 1000      |

---

### Test 2.3: Meal Quantity Validation
**Steps:**
1. Try to enter 0 in meal quantity
2. Try to enter 11 in meal quantity
3. Try to enter -5 in meal quantity
4. Try to enter 15 in meal quantity

**Expected Results:**
- [ ] Value 0 → Auto-corrected to 1
- [ ] Value 11 → Auto-corrected to 10
- [ ] Value -5 → Auto-corrected to 1
- [ ] Value 15 → Auto-corrected to 10
- [ ] No invalid values saved
- [ ] No errors or crashes

---

### Test 2.4: Meal Quantity with Different Status
**Steps:**
1. Set meal quantity to 3
2. Mark as PRESENT → Save
3. Set meal quantity to 2
4. Mark as ABSENT → Save
5. Set meal quantity to 5
6. Mark as LEAVE → Save

**Expected Results:**
- [ ] PRESENT + 3 meals = Rs. 300 deducted
- [ ] ABSENT + 2 meals = Rs. 200 deducted
- [ ] LEAVE + 5 meals = Rs. 0 deducted (leave is free)
- [ ] All saved correctly
- [ ] Balance calculations accurate
- [ ] No errors

---

### Test 2.5: Meal Quantity Persistence
**Steps:**
1. Set meal quantity to 4 for a student
2. Mark as PRESENT
3. Save
4. Refresh page
5. Check same student's meal quantity

**Expected Results:**
- [ ] Meal quantity saved to database
- [ ] After refresh, shows 4 (not reset to 1)
- [ ] Cost calculation still correct
- [ ] No data loss

---

### Test 2.6: Backward Compatibility
**Steps:**
1. Find old attendance records (before migration)
2. View them in attendance page
3. Check meal quantity field

**Expected Results:**
- [ ] Old records display correctly
- [ ] Meal quantity shows 1 (default)
- [ ] No errors or crashes
- [ ] Cost calculations still work
- [ ] Can edit old records

---

## ✅ INTEGRATION TESTING

### Test 3.1: Bulk Action + Meal Quantity
**Steps:**
1. Set different meal quantities for 5 students
2. Use "Mark All Present" bulk action
3. Save and verify

**Expected Results:**
- [ ] All students marked present
- [ ] Meal quantities preserved
- [ ] Costs calculated correctly per student
- [ ] Balances deducted accurately
- [ ] No data loss

---

### Test 3.2: Mixed Operations
**Steps:**
1. Select 3 students with checkboxes
2. Set meal quantity to 2 for selected students
3. Use "Mark Selected Only"
4. Verify results

**Expected Results:**
- [ ] Selected students: ABSENT with 2 meals
- [ ] Other students: PRESENT with 1 meal
- [ ] All costs calculated correctly
- [ ] Stats cards accurate
- [ ] No errors

---

### Test 3.3: Search + Bulk Actions
**Steps:**
1. Search for specific students (e.g., "Ali")
2. Use bulk action on filtered results
3. Clear search
4. Verify all students affected

**Expected Results:**
- [ ] Bulk action applies to ALL students (not just filtered)
- [ ] Search doesn't affect bulk operations
- [ ] All students updated correctly
- [ ] No partial updates

---

### Test 3.4: Date Change
**Steps:**
1. Mark attendance for today
2. Change date to yesterday
3. Verify attendance loads correctly
4. Change date to tomorrow
5. Verify fresh attendance state

**Expected Results:**
- [ ] Each date has independent attendance
- [ ] Changing date loads correct data
- [ ] No cross-date contamination
- [ ] Meal quantities per date preserved
- [ ] No errors

---

### Test 3.5: Balance Calculations
**Steps:**
1. Note student's initial balance
2. Mark attendance with 3 meals (Rs. 300)
3. Check balance after save
4. Verify transaction history

**Expected Results:**
- [ ] Balance = Initial - (Daily Charge × Meal Quantity)
- [ ] Transaction recorded correctly
- [ ] Dashboard stats updated
- [ ] Reports page shows correct data
- [ ] Finance module synced

---

## ✅ UI/UX TESTING

### Test 4.1: Responsive Design
**Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)

**Expected Results:**
- [ ] Desktop: 4-column bulk actions
- [ ] Tablet: 2-column bulk actions
- [ ] Mobile: 2-column bulk actions
- [ ] Table scrolls horizontally on small screens
- [ ] All buttons accessible
- [ ] No layout breaks

---

### Test 4.2: Loading States
**Steps:**
1. Observe initial page load
2. Observe bulk action loading
3. Observe save operation loading

**Expected Results:**
- [ ] Skeleton loaders during initial load
- [ ] Spinner in bulk action buttons
- [ ] Spinner in save button
- [ ] Buttons disabled during loading
- [ ] No double-submissions possible

---

### Test 4.3: Visual Feedback
**Steps:**
1. Select students → Check purple highlight
2. Change meal quantity → Check amber highlight
3. Hover over buttons → Check hover effects
4. Click status buttons → Check active state

**Expected Results:**
- [ ] Selected rows: purple background
- [ ] Changed rows: amber background
- [ ] Hover: smooth transitions
- [ ] Active buttons: solid color + shadow
- [ ] Inactive buttons: outline style
- [ ] All animations smooth

---

### Test 4.4: Toast Notifications
**Steps:**
1. Trigger success operation
2. Trigger error operation
3. Trigger warning operation

**Expected Results:**
- [ ] Success: Green toast with checkmark
- [ ] Error: Red toast with X icon
- [ ] Warning: Yellow toast with warning icon
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Multiple toasts stack correctly
- [ ] Messages in Urdu, clear and helpful

---

## ✅ PERFORMANCE TESTING

### Test 5.1: Large Dataset
**Steps:**
1. Test with 100+ students
2. Use bulk actions
3. Monitor performance

**Expected Results:**
- [ ] Page loads in <2 seconds
- [ ] Bulk action completes in <5 seconds
- [ ] No UI lag or freeze
- [ ] Smooth scrolling
- [ ] No memory leaks

---

### Test 5.2: Network Conditions
**Steps:**
1. Test on fast network (WiFi)
2. Test on slow network (3G simulation)
3. Test offline

**Expected Results:**
- [ ] Fast network: Instant responses
- [ ] Slow network: Loading states visible
- [ ] Offline: Clear error message
- [ ] No crashes on network failure
- [ ] Retry mechanism works

---

## ✅ SECURITY TESTING

### Test 6.1: Authorization
**Steps:**
1. Login as admin
2. Access attendance page
3. Perform bulk actions
4. Logout and login as student
5. Try to access attendance page

**Expected Results:**
- [ ] Admin: Full access
- [ ] Student: No access or read-only
- [ ] Unauthorized requests blocked
- [ ] Proper error messages

---

### Test 6.2: Input Validation
**Steps:**
1. Try SQL injection in search
2. Try XSS in meal quantity
3. Try invalid date formats

**Expected Results:**
- [ ] All inputs sanitized
- [ ] No SQL injection possible
- [ ] No XSS attacks possible
- [ ] Invalid inputs rejected
- [ ] Proper error messages

---

## ✅ EDGE CASES

### Test 7.1: No Students
**Steps:**
1. Delete all students (or use empty database)
2. Navigate to attendance page

**Expected Results:**
- [ ] Empty state message shows
- [ ] No errors or crashes
- [ ] Bulk action buttons disabled
- [ ] Helpful message displayed

---

### Test 7.2: Duplicate Attendance
**Steps:**
1. Mark attendance for a student
2. Try to mark again for same date
3. Verify behavior

**Expected Results:**
- [ ] Second attempt updates existing record
- [ ] No duplicate entries in database
- [ ] Unique constraint enforced
- [ ] No errors

---

### Test 7.3: Concurrent Updates
**Steps:**
1. Open attendance page in two tabs
2. Mark different students in each tab
3. Save from both tabs

**Expected Results:**
- [ ] Both saves succeed
- [ ] No data loss
- [ ] No conflicts
- [ ] Latest data shown after refresh

---

## 📊 Test Results Summary

### Test Execution Date: _____________

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Bulk Actions | 7 | | | |
| Meal Quantity | 6 | | | |
| Integration | 5 | | | |
| UI/UX | 4 | | | |
| Performance | 2 | | | |
| Security | 2 | | | |
| Edge Cases | 3 | | | |
| **TOTAL** | **29** | | | |

---

## 🐛 Bug Report Template

If you find any issues, report using this format:

```
**Bug ID:** BUG-001
**Severity:** High/Medium/Low
**Category:** Bulk Actions / Meal Quantity / UI / Performance / Security

**Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach screenshots if applicable]

**Console Errors:**
[Copy any console errors]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- Date: 2026-05-17
```

---

## ✅ Sign-Off

**Tested By:** _____________________  
**Date:** _____________________  
**Status:** ☐ Passed ☐ Failed ☐ Needs Fixes  
**Comments:** _____________________

---

## 🎯 Acceptance Criteria

All tests must pass before marking feature as complete:

- [ ] All 29 test cases executed
- [ ] Pass rate ≥ 95% (max 1-2 minor issues)
- [ ] No critical bugs
- [ ] No console errors
- [ ] Performance acceptable (<5s for bulk operations)
- [ ] UI/UX smooth and responsive
- [ ] Backward compatibility verified
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

**Status:** ☐ APPROVED ☐ NEEDS WORK

---

**Last Updated:** May 17, 2026  
**Version:** 1.0  
**Next Review:** After production deployment
