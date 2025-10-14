# Shift Scheduling - Complete User Guide

## 📋 Understanding the Workflow

The shift scheduling system requires **TWO STEPS** to publish a roster:

### Step 1: Save Changes (Store in Database)
Save the schedule to the database so it persists.

### Step 2: Publish Roster (Lock & Notify)
Publish the saved schedule, lock it from editing, and notify staff.

---

## ✅ Complete Step-by-Step Guide

### 1️⃣ **Select Department and Week**

```
1. Select a department from the dropdown (or leave as "All Departments")
2. Use the arrow buttons to navigate to the desired week
3. The current week selection is shown as: "October 13-19, 2025"
```

### 2️⃣ **Add Staff Members**

```
1. Click "Add Staff" button
2. Select staff members from the modal
3. Click "Add Selected" to add them to the schedule
```

**Result**: Staff members appear in the schedule table with default "Off Duty" shifts

### 3️⃣ **Assign Shifts**

```
1. For each staff member, click the dropdown for each day
2. Select the shift type:
   - Morning (7AM - 3PM)
   - Evening (3PM - 11PM)
   - Night (11PM - 7AM)
   - On Call
   - Off Duty
```

**Result**: You'll see the "Save Changes *" button turn orange, indicating unsaved changes

### 4️⃣ **Save Changes to Database** ⚠️ CRITICAL STEP

```
1. Click the "Save Changes" button (orange when changes exist)
2. Wait for confirmation: "Schedule changes saved successfully!"
3. The page will reload with saved data
```

**What happens**:
- ✅ Schedules are stored in the database
- ✅ Changes are persisted
- ✅ The orange warning disappears
- ✅ Now ready to publish

**⚠️ Common Mistake**: Skipping this step and clicking "Publish Roster" directly!

### 5️⃣ **Publish Roster**

```
1. After saving, click the "Publish Roster" button
2. Confirm the action in the dialog
3. Wait for success message
```

**What happens**:
- ✅ Schedule becomes locked (read-only)
- ✅ Staff are notified about their shifts
- ✅ Green "Published" badge appears
- ✅ Edit/Delete buttons are disabled

---

## 🔴 Common Errors & Solutions

### Error: "No schedules found for the specified week"

**Cause**: You clicked "Publish Roster" before clicking "Save Changes"

**Solution**:
1. ✅ Add staff members
2. ✅ Assign shifts
3. ✅ **Click "Save Changes" first** ⬅️ Don't skip this!
4. ✅ Then click "Publish Roster"

**Visual Indicator**: If "Save Changes" button is orange, you MUST click it first!

---

### Error: "You have unsaved changes"

**Cause**: You made changes but didn't save them

**Solution**:
1. ✅ Click the orange "Save Changes *" button
2. ✅ Wait for success message
3. ✅ Then try to publish again

**Visual Indicator**: Orange warning banner appears at the top

---

### Error: "This roster is already published"

**Cause**: The roster for this week is already published

**Solution**:
- Option 1: Navigate to a different week
- Option 2: Click "Unpublish Roster" (admin only) to make changes

---

### Error: "Cannot modify published schedule"

**Cause**: Trying to edit a published schedule

**Solution**:
1. ✅ Click "Unpublish Roster" button (admin only)
2. ✅ Make your changes
3. ✅ Click "Save Changes"
4. ✅ Click "Publish Roster" again

---

## 🎨 Visual Indicators

### Orange "Save Changes" Button
```
┌─────────────────────┐
│ Save Changes *      │  ⬅️ Orange background = Unsaved changes
└─────────────────────┘
```
**Action Required**: Click this button before publishing!

### Orange Warning Banner
```
⚠️ You have unsaved changes! Click the "Save Changes" button 
   to save your schedule to the database before publishing.
```
**Action Required**: Save your changes first!

### Green "Published" Badge
```
● Published
```
**Meaning**: This week's roster is locked and staff are notified

---

## 📊 Complete Workflow Diagram

```
START
  ↓
Select Department & Week
  ↓
Add Staff Members
  ↓
Assign Shifts (Morning/Evening/Night/On Call/Off Duty)
  ↓
┌─────────────────────────────────────────┐
│ ⚠️  CRITICAL: Click "Save Changes"      │
│     (Orange button when changes exist)  │
└─────────────────────────────────────────┘
  ↓
Wait for: "Schedule changes saved successfully!"
  ↓
Page Reloads with Saved Data
  ↓
┌─────────────────────────────────────────┐
│ ✅ NOW: Click "Publish Roster"          │
└─────────────────────────────────────────┘
  ↓
Confirm Action
  ↓
Success: "Roster published successfully! X schedules have been published..."
  ↓
Schedule Locked ● Published Badge Appears
  ↓
END
```

---

## 🔄 Button States

### Save Changes Button
| State | Color | Text | Clickable | Meaning |
|-------|-------|------|-----------|---------|
| No Changes | White | Save Changes | Yes | No unsaved changes |
| Has Changes | Orange | Save Changes * | Yes | **MUST CLICK BEFORE PUBLISH** |
| Published | Gray | Save Changes | No | Schedule is published |
| Loading | Gray | Save Changes | No | Saving in progress |

### Publish Roster Button
| State | Color | Text | Clickable | Meaning |
|-------|-------|------|-----------|---------|
| Ready | Green | Publish Roster | Yes | Can publish after saving |
| No Staff | Gray | Publish Roster | No | Add staff first |
| Unsaved | Gray | Publish Roster | No | Save changes first |
| Loading | Gray | Publish Roster | No | Publishing in progress |

---

## ✅ Pre-Publishing Checklist

Before clicking "Publish Roster", verify:

- [ ] Staff members are added to the schedule
- [ ] Shifts are assigned for all required days
- [ ] **"Save Changes" button has been clicked** ⬅️ MOST IMPORTANT!
- [ ] Success message "Schedule changes saved successfully!" was shown
- [ ] Page has reloaded
- [ ] No orange warning banner is visible
- [ ] "Save Changes" button is white (not orange)

**If all checked**: ✅ Safe to click "Publish Roster"

---

## 🎯 Quick Troubleshooting

**Problem**: "Publish Roster" button is disabled
- **Check**: Have you added staff members?
- **Check**: Did you click "Save Changes"?

**Problem**: Getting "No schedules found" error
- **Solution**: You forgot to click "Save Changes" first!

**Problem**: Changes disappear after refresh
- **Solution**: Click "Save Changes" to persist them in database

**Problem**: Can't edit schedule
- **Check**: Is it published? Look for green "Published" badge
- **Solution**: Click "Unpublish Roster" first (admin only)

---

## 🔐 Permissions

### All Admin Users Can:
- ✅ View schedules
- ✅ Add staff to schedules
- ✅ Assign shifts
- ✅ Save changes
- ✅ Publish rosters

### Only Admins Can:
- ✅ Unpublish rosters
- ✅ Delete schedules

---

## 💡 Best Practices

### 1. **Save Early, Save Often**
Don't wait until you've completed the entire schedule. Click "Save Changes" periodically.

### 2. **Check the Week**
Always verify you're working on the correct week before publishing.

### 3. **Department Selection**
If publishing for a specific department, ensure the correct department is selected.

### 4. **Review Before Publishing**
Once published, the schedule is locked. Double-check all shifts before clicking "Publish Roster".

### 5. **Communication**
Inform staff that they'll receive notifications when you publish the roster.

---

## 🆘 Still Having Issues?

If you're still getting errors after following this guide:

1. **Check Backend Server**: Ensure it's running on port 5000
2. **Check Console**: Press F12 and look for error messages
3. **Try Refresh**: Click the "Refresh" button in the scheduling page
4. **Check Database**: Verify schedules are saved in MongoDB
5. **Contact Support**: If issue persists, contact system administrator

---

## 📝 Summary

**Remember**: The system requires **TWO ACTIONS** to publish a roster:

1. **💾 Save Changes** (Store in database)
   - Click orange "Save Changes *" button
   - Wait for success message
   - Page reloads

2. **📢 Publish Roster** (Lock & notify)
   - Click green "Publish Roster" button
   - Confirm action
   - Schedule becomes read-only

**Never skip Step 1!** This is the most common cause of errors.

---

**User Guide Version**: 1.0
**Last Updated**: October 14, 2025
**Status**: Complete and Tested ✅
