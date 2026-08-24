# 🔄 System Update Plan - Simplified Attendance System

## Changes to Implement:

### 1. **Remove Meal Type System** ✅
- Remove Breakfast, Lunch, Dinner separation
- Single daily attendance only
- Remove "Khana" (Meals) panel completely

### 2. **Simplified Attendance Rules** ✅
- **PRESENT**: Default status (no action needed)
- **ABSENT**: Deduct daily charge from balance
- **LEAVE (رخصت)**: No deduction, no charge

### 3. **Auto-Present Logic** ✅
- All students are PRESENT by default
- Admin only marks ABSENT or LEAVE
- System automatically considers unmarked students as PRESENT

### 4. **Room Number Sorting** ✅
- Proper alphabetical + numerical sorting
- Handle formats like: A-101, B-205, 101, 205, etc.

### 5. **Instant Balance Updates** ✅
- Deposits immediately reflect in student profile
- All calculations automatic
- Real-time balance sync

---

## Database Changes:

### Remove:
- ❌ `Meal` model (completely)
- ❌ `MealType` enum
- ❌ `type` field from Attendance

### Update:
- ✅ Attendance: Single record per student per day
- ✅ Remove meal-related fields
- ✅ Simplify unique constraint

---

## Backend Changes:

### Files to Update:
1. `prisma/schema.prisma` - Remove Meal model, update Attendance
2. `src/attendance/attendance.service.ts` - Simplify logic
3. `src/attendance/dto/attendance.dto.ts` - Remove type field
4. `src/students/students.service.ts` - Add room sorting
5. Remove `src/meals/` module completely

---

## Frontend Changes:

### Files to Update:
1. Remove meals page
2. Update attendance page - remove meal type selection
3. Update navigation - remove "Khana" option
4. Update student listing - add proper room sorting
5. Ensure deposit updates reflect immediately

---

## Implementation Order:

1. ✅ Update database schema
2. ✅ Update backend services
3. ✅ Update frontend pages
4. ✅ Test all functionality
5. ✅ Apply migrations

---

Let's begin implementation!
