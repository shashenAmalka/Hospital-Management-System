# Version Conflict Fix

## Problem
Getting error: `Updating the path 'version' would create a conflict at 'version'`

## Root Cause

### The Issue
In the `bulkUpsertSchedules` method, we were using MongoDB update operators incorrectly:

```javascript
update: {
  $set: { ... },
  $setOnInsert: {
    version: 1  // Set version to 1 for new documents
  },
  $inc: { version: 1 }  // ❌ Also increment version (CONFLICT!)
}
```

### Why It Failed
When creating a **new document** (upsert with no existing match):
1. `$setOnInsert` says: "Set version = 1"
2. `$inc` says: "Increment version by 1"
3. MongoDB gets confused: "Do I set it to 1 or increment it?" → **CONFLICT**

### The MongoDB Rule
You **cannot** use `$setOnInsert` and `$inc` on the same field in an upsert operation because:
- `$setOnInsert` only applies when creating new documents
- `$inc` applies to both new and existing documents
- MongoDB doesn't know which to apply first

## Solution

### Strategy
Split the logic into two separate operations:
1. **For existing documents**: Use `$inc` to increment version
2. **For new documents**: Use `$set` to initialize version to 1

### Implementation

```javascript
shiftScheduleSchema.statics.bulkUpsertSchedules = async function(schedules, userId) {
  const operations = [];
  
  for (const schedule of schedules) {
    // Calculate week end date
    const weekEndDate = schedule.weekEndDate || (() => {
      const endDate = new Date(schedule.weekStartDate);
      endDate.setDate(endDate.getDate() + 6);
      return endDate;
    })();

    // Check if document already exists
    const existing = await this.findOne({
      staffId: schedule.staffId,
      weekStartDate: schedule.weekStartDate
    });

    if (existing) {
      // UPDATE: Increment version for existing documents
      operations.push({
        updateOne: {
          filter: { 
            staffId: schedule.staffId, 
            weekStartDate: schedule.weekStartDate 
          },
          update: {
            $set: {
              staffId: schedule.staffId,
              departmentId: schedule.departmentId,
              weekStartDate: schedule.weekStartDate,
              weekEndDate: weekEndDate,
              schedule: schedule.schedule,
              notes: schedule.notes || '',
              lastModifiedBy: userId
            },
            $inc: { version: 1 }  // Increment existing version
          }
        }
      });
    } else {
      // INSERT: Set version to 1 for new documents
      operations.push({
        updateOne: {
          filter: { 
            staffId: schedule.staffId, 
            weekStartDate: schedule.weekStartDate 
          },
          update: {
            $set: {
              staffId: schedule.staffId,
              departmentId: schedule.departmentId,
              weekStartDate: schedule.weekStartDate,
              weekEndDate: weekEndDate,
              schedule: schedule.schedule,
              notes: schedule.notes || '',
              lastModifiedBy: userId,
              createdBy: userId,
              isPublished: false,
              version: 1  // Initialize version
            }
          },
          upsert: true  // Create if doesn't exist
        }
      });
    }
  }
  
  return this.bulkWrite(operations);
};
```

## How It Works

### Scenario 1: New Schedule (First Save)
```
1. Check: Does schedule exist for Staff A, Week Oct 14-20?
   → No

2. Create operation:
   {
     updateOne: {
       filter: { staffId: "abc123", weekStartDate: "2025-10-13" },
       update: {
         $set: { ..., version: 1 }  // Set to 1
       },
       upsert: true
     }
   }

3. Result: New document created with version = 1 ✅
```

### Scenario 2: Updating Existing Schedule
```
1. Check: Does schedule exist for Staff A, Week Oct 14-20?
   → Yes (version: 1)

2. Create operation:
   {
     updateOne: {
       filter: { staffId: "abc123", weekStartDate: "2025-10-13" },
       update: {
         $set: { ... },
         $inc: { version: 1 }  // Increment by 1
       }
     }
   }

3. Result: Existing document updated, version = 2 ✅
```

## Trade-offs

### Before Fix (Single Upsert)
- ✅ Single database operation
- ❌ Caused version conflict error
- ❌ Failed to save schedules

### After Fix (Check + Upsert)
- ✅ No version conflicts
- ✅ Correct version tracking
- ⚠️ Extra database query per schedule (check if exists)

### Performance Note
The extra `findOne` query for each schedule adds some overhead. For typical use cases (5-20 staff members), this is negligible. If you need to optimize for hundreds of schedules at once, consider:
1. Batch the existence checks: `this.find({ staffId: { $in: [...] }, weekStartDate })`
2. Build a Set of existing (staffId, weekStartDate) combinations
3. Use that to decide update vs insert

## Changes Made

### File: `backend/Model/ShiftScheduleModel.js`

**Before**:
```javascript
update: {
  $set: { ... },
  $setOnInsert: { version: 1 },
  $inc: { version: 1 }  // CONFLICT!
}
```

**After**:
```javascript
// Check if exists first
const existing = await this.findOne({ staffId, weekStartDate });

if (existing) {
  // Update: $inc version
  update: { $set: { ... }, $inc: { version: 1 } }
} else {
  // Insert: $set version to 1
  update: { $set: { ..., version: 1 } }
}
```

## Testing

### Test Case 1: Save New Schedule
```bash
# First time saving schedules for Week Oct 14-20
1. Add staff to schedule
2. Assign shifts
3. Click "Save Changes"

Expected: 
- ✅ Success message
- ✅ No version conflict error
- ✅ Database has documents with version = 1
```

### Test Case 2: Update Existing Schedule
```bash
# Modify and save again for same week
1. Change some shifts
2. Click "Save Changes"

Expected:
- ✅ Success message
- ✅ Version incremented to 2
- ✅ Changes saved correctly
```

### Test Case 3: Multiple Staff
```bash
# Save schedules for 10 staff members
1. Add 10 staff members
2. Assign shifts to all
3. Click "Save Changes"

Expected:
- ✅ All 10 schedules saved
- ✅ All have version = 1 (new)
- ✅ No errors
```

### Verify in MongoDB
```javascript
// Check versions
db.shiftschedules.find(
  { weekStartDate: ISODate("2025-10-13T00:00:00.000Z") },
  { staffId: 1, version: 1, createdAt: 1, updatedAt: 1 }
)

// Should show:
// { staffId: "abc123", version: 1, ... }  // First save
// { staffId: "def456", version: 2, ... }  // Updated
```

## Related Files
- `backend/Model/ShiftScheduleModel.js` - Fixed bulkUpsertSchedules method
- `backend/Controller/ShiftScheduleController.js` - Calls bulkUpsertSchedules
- `DEPARTMENT_ID_CONVERSION_FIX.md` - Previous fix for department ID issue

## Summary
The version conflict occurred because we tried to both set and increment the version field in a single upsert operation. The fix checks if the document exists first, then either increments the version (update) or initializes it to 1 (insert). This ensures clean version tracking without conflicts.
