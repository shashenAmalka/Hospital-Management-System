# Prescription System - Workflow Diagrams

## 🔄 Overall System Flow

```
┌─────────────┐
│   PATIENT   │
└──────┬──────┘
       │ 1. Books Appointment
       ▼
┌─────────────────────────┐
│  APPOINTMENT CREATED    │
│  Status: scheduled      │
└──────┬──────────────────┘
       │ 2. Doctor Reviews
       ▼
┌─────────────────────────┐
│       DOCTOR            │
│  Views My Appointments  │
└──────┬──────────────────┘
       │ 3. Confirms Appointment
       ▼
┌─────────────────────────┐
│  APPOINTMENT CONFIRMED  │
│  Status: confirmed      │
│  ✓ Patient assigned     │
│  ✓ Notification sent    │
└──────┬──────────────────┘
       │ 4. Consultation Complete
       ▼
┌─────────────────────────┐
│       DOCTOR            │
│  Views "My Patients"    │
│  ✓ Patient appears here │
└──────┬──────────────────┘
       │ 5. Creates Prescription
       ▼
┌─────────────────────────┐
│  PRESCRIPTION CREATED   │
│  Status: pending        │
└──────┬──────────────────┘
       │ 6. Sends to Pharmacy
       ▼
┌─────────────────────────┐
│  PRESCRIPTION SENT      │
│  Status: sent-to-pharmacy│
│  ✓ Notifications sent    │
└──────┬──────────────────┘
       │ 7. Pharmacist Notified
       ▼
┌─────────────────────────┐
│     PHARMACIST          │
│  Receives Notification  │
│  Views "Prescriptions"  │
└──────┬──────────────────┘
       │ 8. Starts Processing
       ▼
┌─────────────────────────┐
│  PRESCRIPTION PROCESSING│
│  Status: in-progress    │
└──────┬──────────────────┘
       │ 9. Prepares Medicine
       ▼
┌─────────────────────────┐
│  PRESCRIPTION DISPENSED │
│  Status: dispensed      │
│  ✓ Timestamp recorded   │
│  ✓ Pharmacist recorded  │
└─────────────────────────┘
```

---

## 👨‍⚕️ Doctor Workflow

### A. Patient Assignment
```
Doctor Dashboard
       │
       ▼
My Appointments
       │
       ├─ View all appointments
       ├─ Filter by status
       └─ Confirm appointment ──────┐
              │                      │
              ▼                      │
       Status: confirmed             │
              │                      │
              ├─ Patient assigned ◄──┘
              └─ Notification sent
```

### B. Prescription Creation
```
My Patients Page
       │
       ├─ View assigned patients
       ├─ Search patients
       └─ Click "New Prescription"
              │
              ▼
Prescription Modal Opens
       │
       ├─ Enter Diagnosis
       ├─ Add Medicines
       │    ├─ Medicine 1
       │    ├─ Medicine 2
       │    └─ Medicine N (dynamic)
       ├─ Add Notes
       └─ Submit
              │
              ├─ Save as Draft ──────► Status: pending
              │
              └─ Send to Pharmacy ───► Status: sent-to-pharmacy
                                        │
                                        └─ Triggers Notifications
```

---

## 💊 Pharmacist Workflow

### A. Receiving Prescriptions
```
Pharmacist Dashboard
       │
       ├─ Notification Bell (🔔)
       │    └─ Shows new prescriptions
       │
       └─ Prescriptions Menu
              │
              ▼
Prescriptions Page
       │
       ├─ Stats Cards
       │    ├─ New Prescriptions
       │    ├─ In Progress
       │    └─ Dispensed Today
       │
       ├─ Filter by Status
       │    ├─ All
       │    ├─ New
       │    ├─ In Progress
       │    └─ Dispensed
       │
       ├─ Search
       │    ├─ By Patient Name
       │    ├─ By Doctor Name
       │    └─ By Diagnosis
       │
       └─ Prescription Table
              └─ Click "View"
```

### B. Processing Prescriptions
```
View Prescription Details
       │
       ├─ Patient Info
       ├─ Doctor Info
       ├─ Diagnosis
       ├─ Medicines List
       └─ Action Buttons
              │
              ├─ If status = "sent-to-pharmacy"
              │    └─ [Start Processing] ──► Status: in-progress
              │
              ├─ If status = "in-progress"
              │    └─ [Mark as Dispensed] ──► Status: dispensed
              │                                 │
              │                                 ├─ Set dispensedBy
              │                                 └─ Set dispensedAt
              │
              └─ [Close] ──────────────────────► Return to list
```

---

## 🗄️ Data Flow

### Creating a Prescription
```
Frontend (Doctor)                Backend                    Database
     │                              │                          │
     │  POST /prescriptions         │                          │
     ├──────────────────────────────►│                          │
     │                              │  Validate Data           │
     │                              │  ├─ Check Patient exists │
     │                              │  └─ Check Doctor exists  │
     │                              │                          │
     │                              │  Create Prescription     │
     │                              ├──────────────────────────►│
     │                              │                          │
     │                              │  ◄────────────────────────┤
     │                              │  Return Prescription     │
     │  ◄────────────────────────────┤                          │
     │  Display Success             │                          │
     └──────────────────────────────────────────────────────────┘
```

### Sending to Pharmacy
```
Frontend (Doctor)                Backend                    Database
     │                              │                          │
     │  PATCH /:id/send-to-pharmacy │                          │
     ├──────────────────────────────►│                          │
     │                              │  Update Status           │
     │                              ├──────────────────────────►│
     │                              │                          │
     │                              │  Find All Pharmacists    │
     │                              ├──────────────────────────►│
     │                              │  ◄────────────────────────┤
     │                              │                          │
     │                              │  Create Notifications    │
     │                              │  (for each pharmacist)   │
     │                              ├──────────────────────────►│
     │                              │                          │
     │                              │  ◄────────────────────────┤
     │  ◄────────────────────────────┤  Return Success         │
     │  Display Success             │                          │
     └──────────────────────────────────────────────────────────┘
```

---

## 📊 Status Lifecycle

```
┌─────────────┐
│   pending   │ ◄─── Initial state when created
└──────┬──────┘
       │
       │ Doctor clicks "Send to Pharmacy"
       ▼
┌──────────────────┐
│ sent-to-pharmacy │ ◄─── Triggers notifications
└──────┬───────────┘
       │
       │ Pharmacist clicks "Start Processing"
       ▼
┌──────────────┐
│ in-progress  │ ◄─── Pharmacist is preparing
└──────┬───────┘
       │
       │ Pharmacist clicks "Mark as Dispensed"
       ▼
┌──────────────┐
│  dispensed   │ ◄─── Medicine given to patient
└──────┬───────┘      ✓ dispensedBy set
       │              ✓ dispensedAt set
       │ (Optional)
       ▼
┌──────────────┐
│  completed   │ ◄─── Final state
└──────────────┘

       Any time
          │
          ▼
┌──────────────┐
│  cancelled   │ ◄─── Can be cancelled at any stage
└──────────────┘
```

---

## 🔔 Notification Flow

```
Doctor Sends Prescription to Pharmacy
       │
       ▼
Backend finds all users with role = "pharmacist"
       │
       ├─ Pharmacist 1
       │    └─ Create Notification
       │         ├─ title: "New Prescription Available"
       │         ├─ message: "Dr. [Name] sent prescription for [Patient]"
       │         ├─ type: "info"
       │         ├─ relatedTo: { model: "Prescription", id: [...] }
       │         └─ read: false
       │
       ├─ Pharmacist 2
       │    └─ Create Notification
       │
       └─ Pharmacist N
            └─ Create Notification

All Pharmacists' notification bells update
       │
       ▼
Pharmacist views notifications
       │
       ├─ Click notification
       └─ Navigate to Prescriptions page
              │
              └─ View prescription details
```

---

## 🔍 Search & Filter Flow

### Pharmacist Prescriptions Page
```
User Input
    │
    ├─ Status Filter Dropdown
    │    ├─ All
    │    ├─ New (sent-to-pharmacy)
    │    ├─ In Progress (in-progress)
    │    └─ Dispensed (dispensed)
    │
    └─ Search Input
         ├─ Patient Name
         ├─ Doctor Name
         └─ Diagnosis
              │
              ▼
        Apply Filters
              │
              ├─ Filter by status (if not "All")
              └─ Filter by search term
                    │
                    ▼
              Display Results
```

---

## 💾 Database Relationships

```
┌──────────────┐
│     User     │
│ (Patient)    │
└───────┬──────┘
        │
        │ referenced in
        ▼
┌──────────────────┐
│  Prescription    │◄──┐
│                  │   │
│  - patient       │   │
│  - doctor        │───┼───┐
│  - appointment   │   │   │
│  - medicines[]   │   │   │
│  - diagnosis     │   │   │
│  - status        │   │   │
│  - dispensedBy   │───┘   │
│  - dispensedAt   │       │
└──────────────────┘       │
                           │ referenced in
                           ▼
                    ┌──────────────┐
                    │    Staff     │
                    │  (Doctor/    │
                    │  Pharmacist) │
                    └──────────────┘

┌──────────────────┐
│  Notification    │
│                  │
│  - user          │─────► Staff (Pharmacist)
│  - title         │
│  - message       │
│  - relatedTo     │
│    - model       │─────► "Prescription"
│    - id          │─────► Prescription._id
└──────────────────┘
```

---

## 🎯 API Request Flow

### Example: Create and Send Prescription

```javascript
// 1. Doctor creates prescription
const prescription = await fetch('/api/prescriptions', {
  method: 'POST',
  body: {
    patient: 'patient_id',
    doctor: 'doctor_id',
    diagnosis: 'Flu',
    medicines: [...]
  }
});
// Response: { status: 'success', data: {...} }

// 2. Doctor sends to pharmacy
const sent = await fetch('/api/prescriptions/[id]/send-to-pharmacy', {
  method: 'PATCH'
});
// Response: { status: 'success', data: {...} }
// Side effect: Notifications created

// 3. Pharmacist gets prescriptions
const prescriptions = await fetch('/api/prescriptions/pharmacy');
// Response: { status: 'success', results: 5, data: [...] }

// 4. Pharmacist updates status
const updated = await fetch('/api/prescriptions/[id]/status', {
  method: 'PATCH',
  body: {
    status: 'dispensed',
    dispensedBy: 'pharmacist_id'
  }
});
// Response: { status: 'success', data: {...} }
```

---

## 🔄 Auto-Refresh Mechanism

### Pharmacist Prescriptions Page

```
Component Mounts
       │
       ├─ Initial fetch
       │    └─ GET /prescriptions/pharmacy
       │
       └─ Set up interval (30 seconds)
              │
              ▼
        Every 30 seconds
              │
              └─ Fetch prescriptions
                    │
                    ├─ Update state
                    └─ Re-render UI
                          │
                          └─ Show new prescriptions

Component Unmounts
       │
       └─ Clear interval
              │
              └─ Stop auto-refresh
```

---

## 🎨 UI Component Hierarchy

### Doctor: My Patients
```
MyPatients Component
   │
   ├─ Search Bar
   ├─ Refresh Button
   │
   └─ Patients Grid
        │
        └─ Patient Card (foreach patient)
             ├─ Avatar
             ├─ Name & Status
             ├─ Contact Info
             ├─ Last Appointment
             ├─ Last Diagnosis
             └─ [New Prescription] Button
                    │
                    └─ Opens Modal
                         │
                         ├─ Diagnosis Input
                         ├─ Medicines List
                         │    └─ Medicine Form (foreach)
                         │         ├─ Name
                         │         ├─ Dosage
                         │         ├─ Frequency
                         │         ├─ Duration
                         │         ├─ Instructions
                         │         └─ [Remove] Button
                         ├─ [Add Medicine] Button
                         ├─ Notes Input
                         └─ Action Buttons
                              ├─ [Cancel]
                              ├─ [Save as Draft]
                              └─ [Create & Send]
```

### Pharmacist: Prescriptions
```
PharmacistPrescriptions Component
   │
   ├─ Stats Cards Row
   │    ├─ New Count
   │    ├─ In Progress Count
   │    └─ Dispensed Today Count
   │
   ├─ Filters Row
   │    ├─ Search Input
   │    ├─ Status Dropdown
   │    └─ [Refresh] Button
   │
   └─ Prescriptions Table
        │
        └─ Prescription Row (foreach)
             ├─ Patient Info
             ├─ Doctor Info
             ├─ Diagnosis
             ├─ Medicine Count
             ├─ Date
             ├─ Status Badge
             └─ [View] Button
                    │
                    └─ Opens Modal
                         │
                         ├─ Patient Details
                         ├─ Doctor Details
                         ├─ Diagnosis
                         ├─ Medicines List
                         ├─ Notes
                         ├─ Status Info
                         └─ Action Buttons
                              ├─ [Close]
                              ├─ [Start Processing] (if new)
                              └─ [Mark as Dispensed] (if in-progress)
```

---

## 🔐 Future: Role-Based Access Control

```
User Login
     │
     ├─ Role: Doctor
     │    └─ Permissions:
     │         ├─ View own patients
     │         ├─ Create prescriptions
     │         ├─ View own prescriptions
     │         └─ Send to pharmacy
     │
     ├─ Role: Pharmacist
     │    └─ Permissions:
     │         ├─ View pharmacy prescriptions
     │         ├─ Update prescription status
     │         └─ View all prescriptions
     │
     └─ Role: Patient
          └─ Permissions:
               ├─ View own prescriptions
               └─ Download prescription PDF
```

---

## 📱 Responsive Design Breakpoints

```
Mobile (< 640px)
   └─ Single column grid
   └─ Stacked filters
   └─ Full-width modals

Tablet (640px - 1024px)
   └─ Two column grid
   └─ Side-by-side filters
   └─ Large modals

Desktop (> 1024px)
   └─ Three column grid
   └─ Inline filters
   └─ Centered modals
```

---

## ⚡ Performance Optimization

```
Initial Load
   └─ Fetch only visible prescriptions
   └─ Lazy load modals
   └─ Debounce search input

During Use
   └─ Cache API responses
   └─ Optimize re-renders (React.memo)
   └─ Use loading states

Auto-Refresh
   └─ Poll only when tab active
   └─ Exponential backoff on errors
   └─ Cancel pending requests on unmount
```

---

## 🎯 User Journey Summary

### Doctor's Day
```
Morning
  ├─ Login → Dashboard
  ├─ Check "My Appointments"
  ├─ Confirm upcoming appointments
  └─ Patients assigned automatically

During Consultations
  ├─ See patients
  ├─ Complete appointments
  └─ Mark as "completed"

After Consultations
  ├─ Go to "My Patients"
  ├─ Review each patient
  ├─ Create prescriptions
  └─ Send to pharmacy

End of Day
  └─ All prescriptions sent
```

### Pharmacist's Day
```
Morning
  ├─ Login → Dashboard
  ├─ Check notifications
  └─ Go to "Prescriptions"

Throughout Day
  ├─ New prescriptions appear
  ├─ Start processing each
  ├─ Prepare medicines
  └─ Mark as dispensed

Patient Pickup
  ├─ Give medicine to patient
  ├─ Prescription already marked as dispensed
  └─ Update to "completed" (optional)

End of Day
  └─ All prescriptions processed
```

---

This visual guide should help you understand the complete flow and architecture of the prescription management system! 🎉
