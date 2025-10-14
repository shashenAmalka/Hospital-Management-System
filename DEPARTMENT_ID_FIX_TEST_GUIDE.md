# Quick Test Guide - Department ID Fix

## What Was Fixed
The error `Cast to ObjectId failed for value "neurology"` occurred because:
- Staff data has `department` as a **string** (e.g., "neurology")
- Shift schedules need `departmentId` as an **ObjectId** (e.g., "507f1f77bcf86cd799439011")

**Solution**: We now convert department names to department IDs using a mapping.

## Test Steps

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Open Shift Scheduling
1. Navigate to **Admin → Shift Scheduling**
2. **Open Browser Console** (Press F12, go to Console tab)
3. Look for: `Department mapping created: { neurology: "...", cardiology: "..." }`
   - ✅ If you see this, department mapping is working
   - ❌ If not, check that backend departments API is running

### 3. Add Staff to Schedule
1. Click **"Add Staff"** button
2. Select one or more staff members
3. **Watch the console** - you should see:
   ```
   Selected staff to add: [...]
   Department mapping: { neurology: "507f...", ... }
   Converting department "neurology" to ID: 507f1f77bcf86cd799439011
   Staff John Doe: { department: "neurology", extracted: "507f..." }
   ```
4. Click **"Add Selected"**

### 4. Assign Shifts
1. For each added staff, assign shifts by clicking on day cells
2. Choose shift types: Morning, Evening, Night, or Off-Duty

### 5. Save Changes
1. Click **"Save Changes"** button
2. **Expected Results**:
   - ✅ Success message: "Schedules saved successfully"
   - ✅ Orange "Save Changes" button turns blue
   - ✅ No errors in console

### 6. Publish Roster (Optional)
1. After saving, click **"Publish Roster"**
2. Confirm the publish action
3. ✅ Should succeed without errors

## What to Look For

### ✅ Success Indicators
- Department mapping appears in console
- Department conversion logs show ObjectIds (24-character hex strings)
- Save succeeds with success message
- No "Cast to ObjectId failed" errors

### ❌ Failure Indicators
- Department mapping is empty `{}`
- Conversion shows `undefined` for department ID
- Error: "Some staff are missing department IDs"
- Error: "Cast to ObjectId failed"

## Troubleshooting

### Problem: Department mapping is empty
**Console shows**: `Department mapping created: {}`

**Solutions**:
1. Check backend is running on http://localhost:5000
2. Check departments endpoint: http://localhost:5000/api/departments
3. Verify departments exist in database:
   ```bash
   # In MongoDB shell or Compass
   db.departments.find()
   ```
4. Create departments if missing (use Department Management page in admin panel)

### Problem: Staff department doesn't match any department
**Console shows**: `Converting department "xyz" to ID: undefined`

**Solutions**:
1. The staff has a department name that doesn't exist in departments collection
2. Options:
   - Add the missing department to the system
   - Update the staff member's department to an existing one
   - Remove and re-add the staff member after fixing

### Problem: Still getting cast error
**Error**: `Cast to ObjectId failed for value "..." at path "departmentId"`

**Solutions**:
1. Clear browser cache and reload (Ctrl+Shift+R)
2. Check console logs - the value in error should show what's being sent
3. If value is still a string name, the mapping didn't work:
   - Verify departmentMap state is populated
   - Check handleAddSelectedStaff is using the mapping
   - Look for errors in department fetching

## Console Log Examples

### Successful Flow
```
Department mapping created: {
  cardiology: "507f1f77bcf86cd799439011",
  neurology: "507f191e810c19729de860ea",
  emergency: "507f1f77bcf86cd799439012"
}

Selected staff to add: [
  { _id: "abc123", firstName: "John", lastName: "Doe", department: "neurology" }
]

Converting department "neurology" to ID: 507f191e810c19729de860ea
Staff John Doe: {
  department: "neurology",
  departmentId: undefined,
  extractedDeptId: "507f191e810c19729de860ea"
}

Saving schedules: [
  {
    staffId: "abc123",
    departmentId: "507f191e810c19729de860ea",
    weekStartDate: "2025-10-13T00:00:00.000Z",
    schedule: { monday: "morning", tuesday: "evening", ... }
  }
]

✅ Schedules saved successfully
```

### Failed Flow (Missing Mapping)
```
Department mapping created: {}

Converting department "neurology" to ID: undefined
Staff John Doe: {
  department: "neurology",
  extractedDeptId: undefined
}

❌ Error: The following staff members are missing department IDs:
John Doe (dept: neurology)
```

## Next Steps After Success
1. ✅ Verify schedules are saved in database
2. ✅ Try publishing the roster
3. ✅ Check staff can see their schedules
4. ✅ Test editing and re-saving schedules
5. ✅ Test department filter dropdown

## Need Help?
Check these files for implementation details:
- `DEPARTMENT_ID_CONVERSION_FIX.md` - Detailed technical explanation
- `SHIFT_SCHEDULING_USER_GUIDE.md` - Complete user guide
- `QUICK_REFERENCE_SHIFT_SCHEDULING.md` - Quick troubleshooting
