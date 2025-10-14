# 🚀 Quick Start Guide - Test in 5 Minutes

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173` (or your Vite port)
- MongoDB connected
- At least one doctor, patient, and pharmacist account created

---

## ⚡ 5-Minute Test Flow

### Step 1: Create Test Accounts (if not already done)

#### A. Create Doctor Account
```
Role: doctor
Department: cardiology (or any)
Specialization: cardiology (or any)
First Name: John
Last Name: Smith
Email: doctor@test.com
Password: password123
```

#### B. Create Patient Account
```
Role: patient
First Name: Jane
Last Name: Doe
Email: patient@test.com
Password: password123
```

#### C. Create Pharmacist Account
```
Role: pharmacist
Department: pharmacy
First Name: Sarah
Last Name: Johnson
Email: pharmacist@test.com
Password: password123
```

---

### Step 2: Book Appointment (1 minute)

1. **Login as Patient**
   - Email: `patient@test.com`
   - Password: `password123`

2. **Book Appointment**
   - Go to "Book Appointment" or similar
   - Select Doctor: Dr. John Smith
   - Select Date: Tomorrow
   - Select Time: 10:00 AM
   - Reason: "Annual checkup"
   - Click "Book Appointment"
   - ✅ Success message appears

3. **Logout**

---

### Step 3: Confirm Appointment (1 minute)

1. **Login as Doctor**
   - Email: `doctor@test.com`
   - Password: `password123`

2. **View Appointments**
   - Click "My Appointments" in sidebar
   - Find Jane Doe's appointment
   - Status should be "scheduled"

3. **Confirm Appointment**
   - Click confirmation button (✓ icon or "Confirm")
   - Status changes to "confirmed"
   - ✅ Patient receives notification
   - ✅ Patient is now assigned to you

---

### Step 4: Create Prescription (2 minutes)

1. **Go to My Patients**
   - Click "My Patients" in sidebar
   - ✅ Jane Doe appears in the list
   - See her email and last appointment date

2. **Create Prescription**
   - Click "New Prescription" on Jane's card
   - Modal opens

3. **Fill Prescription Form**
   ```
   Diagnosis: Common cold with mild fever
   
   Medicine 1:
   - Name: Paracetamol
   - Dosage: 500mg
   - Frequency: 3 times daily
   - Duration: 5 days
   - Instructions: Take after meals
   
   Click "Add Medicine"
   
   Medicine 2:
   - Name: Vitamin C
   - Dosage: 1000mg
   - Frequency: Once daily
   - Duration: 7 days
   - Instructions: Take in the morning
   
   Notes: Rest and drink plenty of water. Avoid cold drinks.
   ```

4. **Send to Pharmacy**
   - Click "Create & Send to Pharmacy"
   - ✅ Success message appears
   - Modal closes

5. **Stay Logged In** (to verify later)

---

### Step 5: Pharmacist Receives & Processes (1 minute)

1. **Open New Browser Tab/Window**

2. **Login as Pharmacist**
   - Email: `pharmacist@test.com`
   - Password: `password123`

3. **Check Notification**
   - Look at notification bell icon (🔔)
   - Should have "1" badge
   - Click to view notification
   - ✅ "New Prescription Available" notification

4. **View Prescriptions**
   - Click "Prescriptions" in sidebar
   - See stats cards:
     - New Prescriptions: 1
     - In Progress: 0
     - Dispensed Today: 0

5. **View Prescription Details**
   - Find Jane Doe's prescription in table
   - Status badge: "sent to pharmacy" (blue)
   - Click "View" button
   - Modal opens with all details:
     - Patient: Jane Doe
     - Doctor: Dr. John Smith
     - Diagnosis: Common cold with mild fever
     - 2 medicines listed
     - Notes displayed

6. **Start Processing**
   - Click "Start Processing" button
   - ✅ Status changes to "in-progress" (yellow)
   - Button changes to "Mark as Dispensed"

7. **Mark as Dispensed**
   - Click "Mark as Dispensed" button
   - ✅ Status changes to "dispensed" (green)
   - ✅ "Dispensed By" shows Sarah Johnson
   - ✅ "Dispensed At" shows current time

8. **Verify Stats**
   - Close modal
   - Check stats cards:
     - New Prescriptions: 0
     - In Progress: 0
     - Dispensed Today: 1 ✅

---

## ✅ Success Checklist

After completing the test, verify:

### Doctor Side
- [✓] Patient appears in "My Patients" after appointment confirmation
- [✓] Prescription form opens and works
- [✓] Medicines can be added/removed
- [✓] Prescription is created successfully
- [✓] Success message appears

### Pharmacist Side
- [✓] Notification received
- [✓] Prescription appears in list
- [✓] Stats cards show correct counts
- [✓] Prescription details are complete
- [✓] Status can be updated
- [✓] "Dispensed By" and "Dispensed At" are recorded

---

## 🔧 Quick Test Variations

### Test 1: Multiple Medicines
```
Medicine 1: Paracetamol 500mg
Medicine 2: Ibuprofen 400mg
Medicine 3: Cough Syrup 10ml
Medicine 4: Multivitamin 1 tablet
```

### Test 2: Search Functionality
1. Create 3-4 prescriptions
2. Test search by patient name
3. Test search by doctor name
4. Test search by diagnosis

### Test 3: Filter by Status
1. Create multiple prescriptions
2. Send some to pharmacy
3. Process some (in-progress)
4. Dispense some
5. Test each filter option

### Test 4: Refresh Functionality
1. Keep pharmacist page open
2. As doctor, send new prescription
3. Click "Refresh" on pharmacist page
4. New prescription appears

---

## 🐛 Troubleshooting Quick Fixes

### Problem: Patient not showing in "My Patients"
**Fix:**
```
1. Check appointment status is "confirmed" (not "scheduled")
2. Refresh the page
3. Check doctor ID matches in localStorage
```

### Problem: Prescription not appearing for pharmacist
**Fix:**
```
1. Check prescription status is "sent-to-pharmacy"
2. Click the "Refresh" button
3. Check browser console for errors
```

### Problem: Modal not opening
**Fix:**
```
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
```

### Problem: "Cannot read property of undefined"
**Fix:**
```
1. Make sure all IDs are correct
2. Check MongoDB connection
3. Verify doctor/patient/pharmacist exist in database
```

---

## 📊 Test Data Template

Use this template to create test data quickly:

### Test Doctor
```javascript
{
  firstName: "John",
  lastName: "Smith",
  email: "doctor@test.com",
  phone: "+1234567890",
  department: "cardiology",
  role: "doctor",
  specialization: "cardiology",
  password: "password123"
}
```

### Test Patient
```javascript
{
  firstName: "Jane",
  lastName: "Doe",
  email: "patient@test.com",
  phone: "+1234567891",
  role: "patient",
  password: "password123"
}
```

### Test Pharmacist
```javascript
{
  firstName: "Sarah",
  lastName: "Johnson",
  email: "pharmacist@test.com",
  phone: "+1234567892",
  department: "pharmacy",
  role: "pharmacist",
  password: "password123"
}
```

### Test Prescription
```javascript
{
  patient: "<patient_id>",
  doctor: "<doctor_id>",
  diagnosis: "Common cold with mild fever",
  medicines: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "5 days",
      instructions: "Take after meals"
    },
    {
      name: "Vitamin C",
      dosage: "1000mg",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "Take in the morning"
    }
  ],
  notes: "Rest and drink plenty of water"
}
```

---

## 🎯 Testing Checklist

### Basic Functionality
- [ ] Patient assignment works
- [ ] My Patients page loads
- [ ] Prescription modal opens
- [ ] Medicines can be added
- [ ] Prescription is created
- [ ] Prescription is sent to pharmacy
- [ ] Notifications are created
- [ ] Pharmacist receives notification
- [ ] Prescriptions page loads
- [ ] Prescription details display correctly
- [ ] Status can be updated
- [ ] Stats cards update correctly

### Advanced Functionality
- [ ] Search works
- [ ] Filters work
- [ ] Refresh works
- [ ] Multiple medicines work
- [ ] Form validation works
- [ ] Error handling works
- [ ] Loading states show
- [ ] Success messages appear

### UI/UX
- [ ] Responsive design works
- [ ] Icons display correctly
- [ ] Colors are appropriate
- [ ] Modals are centered
- [ ] Tables are readable
- [ ] Buttons are clickable
- [ ] No layout issues

---

## 🎉 You're Done!

If all tests pass, your prescription management system is working perfectly!

### Next Steps:
1. ✅ Test with real data
2. ✅ Customize UI to your needs
3. ✅ Add more features (PDF, analytics, etc.)
4. ✅ Deploy to production

---

## 📞 Need Help?

Check these files:
- `PRESCRIPTION_SYSTEM_GUIDE.md` - Complete guide
- `PRESCRIPTION_API_REFERENCE.md` - API documentation
- `PRESCRIPTION_WORKFLOW_DIAGRAMS.md` - Visual workflows
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

Or check:
- Browser console (F12)
- Backend terminal logs
- MongoDB database directly

---

**Happy Testing! 🚀**
