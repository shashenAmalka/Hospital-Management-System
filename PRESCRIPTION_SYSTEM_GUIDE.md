# Prescription Management System - Implementation Guide

## Overview
This implementation adds a complete prescription management workflow to your Hospital Management System:
1. Doctors can view and manage their assigned patients
2. Doctors can create prescriptions for patients
3. Prescriptions can be sent to the pharmacy
4. Pharmacists receive real-time notifications
5. Pharmacists can process and dispense prescriptions

---

## 🎯 Features Implemented

### 1. Patient Assignment System
- **When**: Doctor confirms an appointment (status = 'confirmed')
- **What**: Patient is automatically assigned to the doctor
- **Where**: Viewable in "My Patients" page

### 2. My Patients Page (Doctor Dashboard)
**Path**: Doctor Dashboard → My Patients

**Features**:
- View all assigned patients (from confirmed/completed appointments)
- Search patients by name or email
- See last visit date and diagnosis
- Create new prescriptions for patients
- Patient cards show:
  - Name, email, phone
  - Last appointment date
  - Last diagnosis
  - Appointment status badge

### 3. Prescription Creation (Doctor)
**From**: My Patients page → Click "New Prescription" button

**Form Fields**:
- **Diagnosis** (required) - Patient's diagnosis
- **Medicines** (required) - Dynamic list with:
  - Medicine name
  - Dosage (e.g., 500mg)
  - Frequency (e.g., 3 times daily)
  - Duration (e.g., 7 days)
  - Instructions (optional)
- **Notes** (optional) - Additional instructions

**Actions**:
- **Save as Draft** - Creates prescription with status 'pending'
- **Create & Send to Pharmacy** - Creates and immediately sends to pharmacy

### 4. Prescription Management (Pharmacist)
**Path**: Pharmacist Dashboard → Prescriptions

**Features**:
- Real-time updates (auto-refresh every 30 seconds)
- Filter by status (New, In Progress, Dispensed)
- Search by patient, doctor, or diagnosis
- View prescription details
- Update prescription status
- Track dispensing activities

**Status Flow**:
1. `sent-to-pharmacy` - New prescription from doctor
2. `in-progress` - Pharmacist started processing
3. `dispensed` - Medicine given to patient
4. `completed` - Process complete

### 5. Notification System
**Trigger**: When doctor sends prescription to pharmacy
**Recipients**: All pharmacists in the system
**Notification Contains**:
- Doctor name
- Patient name
- Link to prescription (via relatedTo field)

---

## 🗄️ Database Models

### Prescription Model
```javascript
{
  patient: ObjectId (ref: User) - Required
  doctor: ObjectId (ref: Staff) - Required
  appointment: ObjectId (ref: Appointment) - Optional
  medicines: [{
    name: String - Required
    dosage: String - Required
    frequency: String - Required
    duration: String - Required
    instructions: String - Optional
  }]
  diagnosis: String - Required
  notes: String - Optional
  status: Enum [pending, sent-to-pharmacy, in-progress, dispensed, completed, cancelled]
  dispensedBy: ObjectId (ref: Staff)
  dispensedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### Updated Notification Model
Added 'Prescription' to relatedTo.model enum

---

## 🔌 API Endpoints

### Prescription Routes (`/api/prescriptions`)

#### GET Endpoints
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `GET /api/prescriptions/patient/:patientId` - Get patient's prescriptions
- `GET /api/prescriptions/doctor/:doctorId` - Get doctor's prescriptions
- `GET /api/prescriptions/pharmacy` - Get prescriptions for pharmacy (sent-to-pharmacy & in-progress)

#### POST Endpoints
- `POST /api/prescriptions` - Create new prescription
  ```json
  {
    "patient": "patient_id",
    "doctor": "doctor_id",
    "diagnosis": "Common cold",
    "medicines": [{
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    }],
    "notes": "Rest and hydration"
  }
  ```

#### PATCH/PUT Endpoints
- `PUT /api/prescriptions/:id` - Update prescription
- `PATCH /api/prescriptions/:id/send-to-pharmacy` - Send to pharmacy (triggers notifications)
- `PATCH /api/prescriptions/:id/status` - Update prescription status
  ```json
  {
    "status": "dispensed",
    "dispensedBy": "pharmacist_id"
  }
  ```

#### DELETE Endpoints
- `DELETE /api/prescriptions/:id` - Delete prescription

### Enhanced Appointment Routes
- `GET /api/appointments/doctor/:doctorId/patients` - Get doctor's assigned patients
  - Returns unique patients from confirmed/completed appointments
  - Includes last appointment details

---

## 🚀 Testing Guide

### Step 1: Set Up Test Data
1. **Create Doctor Account**
   - Role: doctor
   - Department: any
   - Specialization: any

2. **Create Patient Account**
   - Role: patient

3. **Create Pharmacist Account**
   - Role: pharmacist
   - Department: pharmacy

### Step 2: Test Patient Assignment
1. **Login as Patient**
2. **Book an Appointment** with the doctor
3. **Login as Doctor**
4. Go to "My Appointments"
5. **Confirm the appointment** (change status to 'confirmed')
6. Check notification sent to patient

### Step 3: Test My Patients Feature
1. **Stay logged in as Doctor**
2. Go to **"My Patients"** from sidebar
3. Verify patient appears in the list
4. Check patient details:
   - Name, email, phone
   - Last appointment date
   - Last diagnosis (if any)

### Step 4: Test Prescription Creation
1. **From My Patients page**
2. Click **"New Prescription"** on patient card
3. Fill in the form:
   - **Diagnosis**: "Seasonal flu"
   - **Medicine 1**:
     - Name: Paracetamol
     - Dosage: 500mg
     - Frequency: 3 times daily
     - Duration: 5 days
     - Instructions: Take after meals
   - **Medicine 2** (click "Add Medicine"):
     - Name: Cough syrup
     - Dosage: 10ml
     - Frequency: Twice daily
     - Duration: 7 days
   - **Notes**: "Rest and drink plenty of fluids"
4. Click **"Create & Send to Pharmacy"**
5. Verify success message

### Step 5: Test Pharmacist Notifications
1. **Login as Pharmacist**
2. Check **notification bell icon** in header
3. Should see notification: "New Prescription Available"
4. Click notification to view details

### Step 6: Test Prescription Management
1. **Stay logged in as Pharmacist**
2. Go to **"Prescriptions"** from sidebar
3. Verify prescription appears in the list
4. Check **stats cards** show correct counts
5. **Click "View"** on prescription
6. Verify all details are correct
7. **Click "Start Processing"**
8. Status changes to "in-progress"
9. **Click "Mark as Dispensed"**
10. Status changes to "dispensed"
11. Verify "Dispensed By" shows your name

### Step 7: Test Filters and Search
1. **In Pharmacist Prescriptions page**
2. Test status filter dropdown
3. Test search by patient name
4. Test search by doctor name
5. Verify results update correctly

---

## 🎨 UI/UX Features

### My Patients Page (Doctor)
- **Grid layout** - 3 columns on large screens, responsive
- **Search bar** - Real-time filtering
- **Refresh button** - Manual data reload
- **Patient cards** with:
  - Avatar placeholder
  - Status badge (completed/confirmed)
  - Contact information
  - Last diagnosis preview
  - Action button

### Prescription Modal (Doctor)
- **Full-screen modal** with scrolling
- **Sticky header and footer**
- **Dynamic medicine list** - Add/remove medicines
- **Form validation** - Required fields marked
- **Two save options** - Draft or Send to Pharmacy

### Prescriptions Dashboard (Pharmacist)
- **Stats cards** - Quick overview of prescription counts
- **Filter and search** - Find prescriptions easily
- **Table view** - All prescriptions with key details
- **Status badges** - Color-coded for quick identification
- **Detail modal** - Complete prescription information
- **Action buttons** - Context-aware based on status

---

## 🔧 Technical Implementation

### Backend
- **MVC Architecture** - Models, Controllers, Routes
- **Async/Await** - All database operations
- **Error Handling** - Try-catch with proper error responses
- **Population** - Automatic population of related documents
- **Validation** - Schema-level and controller-level validation

### Frontend
- **React Hooks** - useState, useEffect
- **Component-based** - Reusable, modular components
- **Responsive Design** - Works on all screen sizes
- **Icons** - Lucide React icons throughout
- **Fetch API** - HTTP requests with proper headers
- **Local Storage** - User data and tokens
- **Real-time Updates** - Polling for new prescriptions (30s interval)

### Security
- **JWT Authentication** - Token-based auth (prepared)
- **Authorization Headers** - Sent with all requests
- **Input Validation** - Client and server-side
- **Error Messages** - User-friendly, no sensitive data leak

---

## 📝 Code Quality

### Best Practices Followed
✅ RESTful API design
✅ Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
✅ Meaningful variable and function names
✅ Comments for complex logic
✅ Error handling throughout
✅ Loading states for better UX
✅ User feedback (alerts, success messages)
✅ Consistent code formatting
✅ Component separation and reusability

---

## 🔮 Optional Enhancements (Future)

### WebSocket Implementation
For real-time notifications instead of polling:

1. **Install Socket.io** (already in your project):
   ```bash
   # Backend has socket.io server initialized
   # Frontend needs socket.io-client
   npm install socket.io-client
   ```

2. **Backend Event Emission**:
   In `PrescriptionController.js` > `sendToPharmacy`:
   ```javascript
   const io = require('../utils/socketServer').getIO();
   io.emit('newPrescription', { prescription });
   ```

3. **Frontend Socket Listener**:
   In `PharmacistPrescriptions.jsx`:
   ```javascript
   import io from 'socket.io-client';
   
   useEffect(() => {
     const socket = io('http://localhost:5000');
     socket.on('newPrescription', () => {
       fetchPrescriptions();
     });
     return () => socket.disconnect();
   }, []);
   ```

---

## 🐛 Troubleshooting

### Issue: Patients not showing in "My Patients"
**Solution**: 
- Ensure appointments are confirmed (status = 'confirmed')
- Check doctor ID matches in localStorage
- Verify API endpoint returns data

### Issue: Prescriptions not appearing for pharmacist
**Solution**:
- Ensure prescription status is 'sent-to-pharmacy'
- Check pharmacist role in database
- Verify API endpoint `/api/prescriptions/pharmacy`

### Issue: Notifications not working
**Solution**:
- Check pharmacist users exist in database
- Verify Notification model includes 'Prescription' in enum
- Check browser console for errors

### Issue: "Cannot read property of undefined"
**Solution**:
- Check data is populated correctly
- Add optional chaining (`?.`) in frontend code
- Verify all refs in models are correct

---

## 📊 Database Queries for Testing

### Find all prescriptions
```javascript
db.prescriptions.find({}).populate('patient doctor')
```

### Find prescriptions for specific doctor
```javascript
db.prescriptions.find({ doctor: ObjectId('doctor_id') })
```

### Find pending prescriptions for pharmacy
```javascript
db.prescriptions.find({ 
  status: { $in: ['sent-to-pharmacy', 'in-progress'] } 
})
```

### Count prescriptions by status
```javascript
db.prescriptions.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```

---

## ✅ Checklist

### Backend
- [x] Prescription Model created
- [x] Prescription Controller with CRUD operations
- [x] Prescription Routes defined
- [x] Routes registered in app.js
- [x] Notification Model updated
- [x] Appointment Controller enhanced (patient assignment)
- [x] Doctor patients endpoint added

### Frontend - Doctor
- [x] MyPatients component created
- [x] Prescription creation modal
- [x] Form validation
- [x] Medicine dynamic list
- [x] Send to pharmacy functionality
- [x] DoctorLayout updated
- [x] Component exported

### Frontend - Pharmacist
- [x] PharmacistPrescriptions component created
- [x] Prescription list with filters
- [x] Status management
- [x] Detail modal
- [x] Real-time updates (polling)
- [x] PharmacistLayout updated
- [x] PharmacistSidebar updated
- [x] Component exported

### Testing
- [ ] Test patient assignment
- [ ] Test My Patients page
- [ ] Test prescription creation
- [ ] Test send to pharmacy
- [ ] Test pharmacist notifications
- [ ] Test prescription status updates
- [ ] Test filters and search
- [ ] Test error handling

---

## 🎓 Learning Resources

### MVC Pattern
- Model: Data structure and database schema
- View: React components (UI)
- Controller: Business logic and API handlers

### RESTful API
- GET: Retrieve data
- POST: Create new resource
- PUT: Update entire resource
- PATCH: Update partial resource
- DELETE: Remove resource

### React Hooks
- useState: Component state management
- useEffect: Side effects and lifecycle
- Custom hooks: Reusable logic (can be added)

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for server errors
3. Verify MongoDB connection
4. Check user roles and permissions
5. Verify API endpoints are responding

---

## 🎉 Congratulations!

You now have a complete prescription management system with:
- Patient-Doctor assignment
- Prescription creation and management
- Pharmacy integration
- Real-time notifications
- Professional UI/UX

Happy coding! 🚀
