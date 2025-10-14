# Prescription System - API Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All requests should include:
```
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

---

## 📋 Prescription Endpoints

### Get All Prescriptions
```http
GET /prescriptions
```
**Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": [...]
}
```

---

### Get Prescription by ID
```http
GET /prescriptions/:id
```
**Example:** `GET /prescriptions/67abc123def456`

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "67abc123def456",
    "patient": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "doctor": {
      "firstName": "Sarah",
      "lastName": "Smith",
      "specialization": "Family Medicine"
    },
    "diagnosis": "Common cold",
    "medicines": [...],
    "status": "sent-to-pharmacy",
    "createdAt": "2025-10-15T10:30:00Z"
  }
}
```

---

### Get Prescriptions by Patient
```http
GET /prescriptions/patient/:patientId
```
**Example:** `GET /prescriptions/patient/67abc123`

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": [...]
}
```

---

### Get Prescriptions by Doctor
```http
GET /prescriptions/doctor/:doctorId
```
**Example:** `GET /prescriptions/doctor/67abc456`

**Response:**
```json
{
  "status": "success",
  "results": 15,
  "data": [...]
}
```

---

### Get Prescriptions for Pharmacy
```http
GET /prescriptions/pharmacy
```
Returns prescriptions with status: `sent-to-pharmacy` or `in-progress`

**Response:**
```json
{
  "status": "success",
  "results": 8,
  "data": [...]
}
```

---

### Create Prescription
```http
POST /prescriptions
```

**Request Body:**
```json
{
  "patient": "67abc123def456",
  "doctor": "67abc789ghi012",
  "appointment": "67abc345jkl678",
  "diagnosis": "Seasonal flu with mild fever",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    },
    {
      "name": "Cough Syrup",
      "dosage": "10ml",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take before bed"
    }
  ],
  "notes": "Rest and drink plenty of fluids. Avoid cold drinks.",
  "status": "pending"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "67abc999",
    "patient": {...},
    "doctor": {...},
    ...
  }
}
```

**Validation:**
- `patient` - Required, must be valid User ID
- `doctor` - Required, must be valid Staff ID
- `diagnosis` - Required, non-empty string
- `medicines` - Required, array with at least one item
  - Each medicine must have: `name`, `dosage`, `frequency`, `duration`

---

### Update Prescription
```http
PUT /prescriptions/:id
```

**Request Body:**
```json
{
  "diagnosis": "Updated diagnosis",
  "notes": "Updated notes",
  "medicines": [...]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {...}
}
```

---

### Send Prescription to Pharmacy
```http
PATCH /prescriptions/:id/send-to-pharmacy
```

**What it does:**
1. Updates prescription status to `sent-to-pharmacy`
2. Creates notifications for all pharmacists
3. Returns updated prescription

**Request Body:** None required

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "67abc999",
    "status": "sent-to-pharmacy",
    ...
  }
}
```

**Side Effects:**
- Notifications created in `notifications` collection
- All users with role `pharmacist` receive notification

---

### Update Prescription Status
```http
PATCH /prescriptions/:id/status
```

**Request Body:**
```json
{
  "status": "in-progress",
  "dispensedBy": "67abc456def789"
}
```

**Status Options:**
- `pending` - Initial state
- `sent-to-pharmacy` - Sent by doctor
- `in-progress` - Pharmacist processing
- `dispensed` - Medicine given to patient
- `completed` - Process complete
- `cancelled` - Prescription cancelled

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "67abc999",
    "status": "dispensed",
    "dispensedBy": {...},
    "dispensedAt": "2025-10-15T14:30:00Z"
  }
}
```

**Auto-populated fields:**
- When status is `dispensed` or `completed`:
  - `dispensedBy` is set
  - `dispensedAt` is set to current date/time

---

### Delete Prescription
```http
DELETE /prescriptions/:id
```

**Response:**
```
Status: 204 No Content
```

---

## 👥 Appointment Endpoints (Enhanced)

### Get Doctor's Patients
```http
GET /appointments/doctor/:doctorId/patients
```

**What it does:**
- Gets unique patients from doctor's confirmed/completed appointments
- Returns patient details
- Includes last appointment information

**Example:** `GET /appointments/doctor/67abc456/patients`

**Response:**
```json
{
  "status": "success",
  "results": 12,
  "data": [
    {
      "_id": "67abc123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "lastAppointment": {
        "_id": "67abc789",
        "appointmentDate": "2025-10-10T00:00:00Z",
        "appointmentTime": "10:30",
        "status": "completed",
        "diagnosis": "Common cold"
      }
    },
    ...
  ]
}
```

**Query Logic:**
- Only includes patients from appointments with status: `confirmed` or `completed`
- Sorted by most recent appointment
- Each patient includes their last appointment details

---

### Update Appointment Status
```http
PATCH /appointments/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Enhanced Behavior:**
When status is set to `confirmed`:
- Creates notification for patient
- Patient is now "assigned" to doctor
- Patient will appear in doctor's "My Patients" page

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "67abc789",
    "status": "confirmed",
    "patient": {...},
    "doctor": {...}
  }
}
```

---

## 📬 Notification Model (Updated)

### Prescription Notifications
When prescription is sent to pharmacy, notifications are created with:

```json
{
  "user": "pharmacist_id",
  "title": "New Prescription Available",
  "message": "A new prescription has been sent by Dr. Sarah Smith for patient John Doe.",
  "type": "info",
  "read": false,
  "relatedTo": {
    "model": "Prescription",
    "id": "prescription_id"
  },
  "createdAt": "2025-10-15T10:30:00Z"
}
```

### Related Model Options
The `relatedTo.model` field now accepts:
- `Test`
- `Patient`
- `Appointment`
- `LabInventory`
- `Equipment`
- `Prescription` ← **New**

---

## 🔍 Frontend API Usage Examples

### Create Prescription (Frontend)
```javascript
const createPrescription = async (prescriptionData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/prescriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(prescriptionData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
};
```

---

### Send to Pharmacy (Frontend)
```javascript
const sendToPharmacy = async (prescriptionId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/prescriptions/${prescriptionId}/send-to-pharmacy`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
};
```

---

### Get Doctor's Patients (Frontend)
```javascript
const getDoctorPatients = async (doctorId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/appointments/doctor/${doctorId}/patients`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
};
```

---

### Get Pharmacy Prescriptions (Frontend)
```javascript
const getPharmacyPrescriptions = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:5000/api/prescriptions/pharmacy',
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
};
```

---

### Update Prescription Status (Frontend)
```javascript
const updatePrescriptionStatus = async (prescriptionId, status, pharmacistId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/prescriptions/${prescriptionId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: status,
        dispensedBy: pharmacistId
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
};
```

---

## 🎯 Common Use Cases

### 1. Doctor Creates and Sends Prescription
```javascript
// Step 1: Create prescription
const prescription = await createPrescription({
  patient: patientId,
  doctor: doctorId,
  diagnosis: "Seasonal flu",
  medicines: [{
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "3 times daily",
    duration: "5 days"
  }],
  notes: "Rest and hydration"
});

// Step 2: Send to pharmacy
await sendToPharmacy(prescription._id);
```

---

### 2. Pharmacist Processes Prescription
```javascript
// Step 1: Get new prescriptions
const prescriptions = await getPharmacyPrescriptions();

// Step 2: Start processing
await updatePrescriptionStatus(
  prescriptionId,
  'in-progress',
  pharmacistId
);

// Step 3: Mark as dispensed
await updatePrescriptionStatus(
  prescriptionId,
  'dispensed',
  pharmacistId
);
```

---

### 3. Doctor Views Their Patients
```javascript
// Get doctor ID from localStorage
const userData = JSON.parse(localStorage.getItem('user'));
const doctorId = userData._id;

// Fetch patients
const patients = await getDoctorPatients(doctorId);

// Display in UI
patients.forEach(patient => {
  console.log(`${patient.firstName} ${patient.lastName}`);
  console.log(`Last visit: ${patient.lastAppointment?.appointmentDate}`);
});
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Prescription not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

---

## 🔐 Authorization Notes

Currently, the system uses a pass-through authentication middleware that allows all requests. In production:

1. Implement proper JWT verification
2. Add role-based access control (RBAC)
3. Restrict endpoints by user role:
   - Doctors: Create prescriptions, view their patients
   - Pharmacists: View and update prescriptions
   - Patients: View their own prescriptions only

---

## 📊 Status Workflow

```
pending
    ↓
sent-to-pharmacy (triggers notifications)
    ↓
in-progress
    ↓
dispensed (auto-sets dispensedBy and dispensedAt)
    ↓
completed
```

Alternative flows:
- `pending` → `cancelled`
- Any status → `cancelled`

---

## 🧪 Testing with Postman/Thunder Client

### Create Prescription Test
```
POST http://localhost:5000/api/prescriptions
Headers:
  Content-Type: application/json
  Authorization: Bearer <your-token>

Body:
{
  "patient": "67abc123",
  "doctor": "67abc456",
  "diagnosis": "Test diagnosis",
  "medicines": [
    {
      "name": "Test Medicine",
      "dosage": "100mg",
      "frequency": "Once daily",
      "duration": "7 days"
    }
  ]
}
```

### Send to Pharmacy Test
```
PATCH http://localhost:5000/api/prescriptions/<prescription-id>/send-to-pharmacy
Headers:
  Content-Type: application/json
  Authorization: Bearer <your-token>
```

---

## 📞 Quick Reference Card

| Action | Method | Endpoint |
|--------|--------|----------|
| Get all prescriptions | GET | `/prescriptions` |
| Get one prescription | GET | `/prescriptions/:id` |
| Get patient's prescriptions | GET | `/prescriptions/patient/:patientId` |
| Get doctor's prescriptions | GET | `/prescriptions/doctor/:doctorId` |
| Get pharmacy queue | GET | `/prescriptions/pharmacy` |
| Create prescription | POST | `/prescriptions` |
| Update prescription | PUT | `/prescriptions/:id` |
| Send to pharmacy | PATCH | `/prescriptions/:id/send-to-pharmacy` |
| Update status | PATCH | `/prescriptions/:id/status` |
| Delete prescription | DELETE | `/prescriptions/:id` |
| Get doctor's patients | GET | `/appointments/doctor/:doctorId/patients` |

---

## 🎉 You're All Set!

Use this API reference to:
- Integrate with mobile apps
- Build custom dashboards
- Create reports
- Test functionality
- Debug issues

Happy coding! 🚀
