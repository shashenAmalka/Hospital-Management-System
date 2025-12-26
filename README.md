# 🏥 Hospital Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D4.4-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)

A comprehensive Hospital Management System built with MERN stack (MongoDB, Express.js, React, Node.js) to streamline hospital operations including patient management, appointments, lab reports, pharmacy, and staff management.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 👥 Patient Management
- ✅ Patient registration and profile management
- ✅ Medical history tracking
- ✅ Appointment scheduling
- ✅ Patient search and filtering
- ✅ Generate patient reports (PDF)

### 📅 Appointment System
- ✅ Online appointment booking
- ✅ Doctor availability checking
- ✅ Appointment status tracking (Scheduled, Completed, Cancelled)
- ✅ Appointment rescheduling and cancellation
- ✅ Real-time notifications

### 🧪 Laboratory Management
- ✅ Lab test requests
- ✅ Test result entry and management
- ✅ Lab report generation
- ✅ Test type management
- ✅ Quality control tracking

### 💊 Pharmacy Module
- ✅ Medication inventory management
- ✅ Prescription management
- ✅ Drug dispensing records
- ✅ Stock alerts and expiry notifications
- ✅ Supplier management

### 👨‍⚕️ Staff Management
- ✅ Doctor profiles and specializations
- ✅ Staff scheduling
- ✅ Department allocation
- ✅ Certification management
- ✅ Leave management

### 📊 Reports & Analytics
- ✅ Patient statistics
- ✅ Appointment analytics
- ✅ Inventory reports
- ✅ Performance metrics
- ✅ Activity dashboards

### 🔐 Security Features
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password encryption (bcrypt)
- ✅ Secure API endpoints
- ✅ Session management

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI Library
- **React Router** 6.x - Navigation
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Chart.js** - Data Visualization

### Backend
- **Node.js** 14+ - Runtime Environment
- **Express.js** 4.18 - Web Framework
- **MongoDB** 4.4+ - Database
- **Mongoose** 7.x - ODM
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Uploads
- **PDFKit** - PDF Generation

### Development Tools
- **Vite** - Frontend Build Tool
- **Nodemon** - Backend Hot Reload
- **ESLint** - Code Linting
- **Git** - Version Control

---

## 💻 System Requirements

### Minimum Requirements
- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **MongoDB**: >= 4.4
- **RAM**: 4GB
- **Storage**: 500MB free space

### Recommended
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MongoDB**: >= 6.0
- **RAM**: 8GB
- **Storage**: 1GB free space

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/shashenAmalka/Hospital-Management-System.git
cd Hospital-Management-System
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configurations (see Configuration section)
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from root)
cd ../frontend

# Install dependencies
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hospital_management
DB_NAME=hospital_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to Git
- Change `JWT_SECRET` to a strong random string
- Use different secrets for development and production
- Enable HTTPS in production

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎮 Running the Application

### Development Mode

#### Run Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Run Frontend (New Terminal)
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 📁 Project Structure

```
Hospital-Management-System/
│
├── backend/                      # Backend application
│   ├── Controller/               # Route controllers
│   │   ├── AuthController.js
│   │   ├── PatientController.js
│   │   ├── AppointmentController.js
│   │   ├── LabController.js
│   │   └── PharmacyController.js
│   │
│   ├── Model/                    # Database models
│   │   ├── UserModel.js
│   │   ├── PatientModel.js
│   │   ├── AppointmentModel.js
│   │   └── PrescriptionModel.js
│   │
│   ├── Route/                    # API routes
│   │   ├── AuthRoutes.js
│   │   ├── PatientRoutes.js
│   │   ├── AppointmentRoutes.js
│   │   └── LabRoutes.js
│   │
│   ├── middleware/               # Custom middleware
│   │   └── authMiddleware.js    # JWT authentication
│   │
│   ├── utils/                    # Utility functions
│   │   ├── appError.js
│   │   └── catchAsync.js
│   │
│   ├── uploads/                  # File uploads
│   │   ├── certifications/
│   │   └── leave-documents/
│   │
│   ├── app.js                    # Express app setup
│   ├── package.json              # Backend dependencies
│   └── .env                      # Environment variables (not in Git)
│
├── frontend/                     # Frontend application
│   ├── public/                   # Static assets
│   │
│   ├── src/
│   │   ├── Components/           # React components
│   │   │   ├── PatientDashboard/
│   │   │   ├── Admin/
│   │   │   └── Notifications/
│   │   │
│   │   ├── Pages/                # Page components
│   │   │   └── Login.jsx
│   │   │
│   │   ├── context/              # React context
│   │   │
│   │   ├── utils/                # Helper functions
│   │   │
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   │
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
└── LICENSE                       # License file
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "Shashen_Amalka",
  "email": "shashen@example.com",
  "password": "SecurePass123",
  "role": "patient"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "Shashen_Amalka",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "673a1234567890",
    "username": "Shashen_Amalka",
    "role": "patient"
  }
}
```

### Patients

#### Create Patient
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dob": "1990-01-15",
  "gender": "female",
  "phone": "0771234567",
  "email": "jane@example.com"
}
```

#### Get All Patients
```http
GET /api/patients
Authorization: Bearer {token}
```

#### Get Patient by ID
```http
GET /api/patients/:id
Authorization: Bearer {token}
```

### Appointments

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient": "patient_id",
  "doctor": "doctor_id",
  "appointmentDate": "2024-12-30",
  "appointmentTime": "10:00 AM",
  "reason": "Regular checkup"
}
```

#### Get Patient Appointments
```http
GET /api/appointments/user/:userId
Authorization: Bearer {token}
```

### Lab Reports

#### Create Lab Request
```http
POST /api/lab-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "patient_id",
  "testType": "Blood Test",
  "priority": "normal",
  "notes": "Fasting required"
}
```

### Error Responses

```http
400 Bad Request
{
  "success": false,
  "message": "Validation error"
}

401 Unauthorized
{
  "success": false,
  "message": "No token provided"
}

404 Not Found
{
  "success": false,
  "message": "Resource not found"
}

500 Internal Server Error
{
  "success": false,
  "message": "Server error"
}
```

---

## 👥 User Roles & Permissions

| Feature | Patient | Doctor | Lab Tech | Pharmacist | Admin |
|---------|---------|--------|----------|------------|-------|
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book Appointment | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Appointments | ✅ Own | ✅ Assigned | ❌ | ❌ | ✅ All |
| Update Appointment | ❌ | ✅ | ❌ | ❌ | ✅ |
| Create Lab Request | ❌ | ✅ | ❌ | ❌ | ✅ |
| Enter Lab Results | ❌ | ❌ | ✅ | ❌ | ✅ |
| View Lab Reports | ✅ Own | ✅ | ✅ | ❌ | ✅ All |
| Dispense Medication | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: MongoNetworkError: failed to connect to server
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change PORT in .env
```

#### JWT Token Expired
```
Error: jwt expired
```
**Solution:**
- Login again to get new token
- Increase JWT_EXPIRE time in `.env`

#### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Check FRONTEND_URL in backend `.env`
- Ensure CORS is properly configured in `app.js`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Contribution

**Shashen Amalka**
- GitHub: [@shashenAmalka](https://github.com/shashenAmalka)
- Project Link: https://github.com/shashenAmalka/Hospital-Management-System
- GitHub: [@Ruchiyah](https://github.com/Ruchiyah)
- GitHub: [@nadeera11](https://github.com/nadeera11)
- GitHub: [@Gihan-Benaragama](https://github.com/Gihan-Benaragama)
- GitHub: [@TaniyaDriburgh123](https://github.com/TaniyaDriburgh123)
---

## 🙏 Acknowledgments

- Built with ❤️ for the healthcare community
- Thanks to all contributors
- Powered by MERN stack

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

