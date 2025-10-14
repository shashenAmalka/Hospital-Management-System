# 🎯 Quick Reference: Registration & Login System

## Registration Form Fields

| Field | Type | Required | Purpose | Notes |
|-------|------|----------|---------|-------|
| `firstName` | String | ✅ Yes | User's first name | Combined with lastName as "name" in DB |
| `lastName` | String | ✅ Yes | User's last name | Combined with firstName as "name" in DB |
| `email` | String | ✅ Yes | Login identifier | Must be unique, used for authentication |
| `password` | String | ✅ Yes | Authentication | Min 6 chars, hashed with bcrypt |
| `confirmPassword` | String | ✅ Yes | Validation | Frontend only, not sent to backend |
| `mobileNumber` | String | ✅ Yes | Contact info | Must be unique, 10-15 digits |
| `gender` | String | ✅ Yes | User info | Enum: male, female, other |
| `age` | Number | ❌ No | User info | 0-120, auto-calculated from DOB |
| `dob` | Date | ❌ No | User info | Date of birth |
| `address` | String | ❌ No | User info | Optional text field |

## Login Form Fields

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `email` | String | ✅ Yes | User identifier for login |
| `password` | String | ✅ Yes | User authentication |

## Data Mapping

### Frontend → Backend → Database

```
Registration Form Data:
├── firstName: "John"       ┐
├── lastName: "Doe"         ├─→ name: "John Doe" (in DB)
├── email: "john@test.com"  ┘
├── password: "pass123"     ──→ password: "$2a$10$hash..." (bcrypt)
├── mobileNumber: "1234567890"
├── gender: "male"
├── age: 30
├── dob: "1993-01-01"
└── address: "123 Main St"

Database User Document:
{
  name: "John Doe",          ← firstName + lastName
  email: "john@test.com",
  password: "$2a$10$...",     ← Hashed
  mobileNumber: "1234567890",
  gender: "male",
  age: 30,
  dob: "1993-01-01T00:00:00.000Z",
  address: "123 Main St",
  role: "patient",            ← Auto-assigned
  isActive: true,             ← Auto-assigned
  createdAt: "2025-01-01...", ← Auto-assigned
  updatedAt: "2025-01-01..."  ← Auto-assigned
}
```

## API Endpoints Quick Reference

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobileNumber": "1234567890",
  "gender": "male"
}

Response: { token, user }
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

## Common Error Codes

| Status | Message | Meaning | Solution |
|--------|---------|---------|----------|
| 400 | Required fields: ... | Missing required data | Fill all required fields |
| 400 | User already exists with this email | Duplicate email | Use different email |
| 400 | User already exists with this mobile number | Duplicate mobile | Use different mobile number |
| 401 | Invalid credentials | Wrong email/password | Check credentials |
| 500 | Server error | Backend issue | Check server logs |

## Validation Rules

### Email
- ✅ Must be unique
- ✅ Valid email format: `xxx@xxx.xxx`
- ✅ Automatically converted to lowercase

### Password
- ✅ Minimum 6 characters
- ✅ Must match confirmPassword (frontend)
- ✅ Automatically hashed with bcrypt

### Mobile Number
- ✅ Must be unique
- ✅ Format: 10-15 digits
- ✅ Can include `+` prefix

### Age
- ✅ Range: 0-120
- ✅ Auto-calculated from DOB if provided

## Frontend Files

```
src/
├── Components/
│   ├── Register/
│   │   └── Register.jsx         ← Registration form
│   └── Login/
│       └── Login.jsx             ← Login form
├── context/
│   └── AuthContext.jsx           ← Auth state management
└── utils/
    └── api.js                    ← API service functions
```

## Backend Files

```
backend/
├── Controller/
│   └── AuthController.js         ← register, login functions
├── Model/
│   └── UserModel.js              ← User schema + validation
└── Route/
    └── AuthRoutes.js             ← /api/auth routes
```

## Testing URLs

```
Registration Form:  http://localhost:5173/signup
Login Form:         http://localhost:5173/login
CORS Test:          http://localhost:5173/cors-test.html
Auth Flow Test:     http://localhost:5173/auth-flow-test.html
```

## Quick Debug Checklist

**Registration Issues:**
- [ ] All required fields filled?
- [ ] Password matches confirmPassword?
- [ ] Email format valid?
- [ ] Mobile number format valid?
- [ ] Backend server running?
- [ ] Check browser console for errors
- [ ] Check network tab for API response

**Login Issues:**
- [ ] Email matches registered email?
- [ ] Password matches registered password?
- [ ] User account exists in database?
- [ ] Backend server running?
- [ ] Check browser console for errors
- [ ] Token stored in localStorage?

## Environment Setup

```bash
# Backend
cd backend
npm install
npm start              # Runs on port 5000

# Frontend
cd frontend
npm install
npm run dev            # Runs on port 5173
```

## localStorage Keys

After successful login, these are stored:
- `token` - JWT authentication token
- `user` - User object (JSON string)
- `user_name` - User's full name

## Password Security

```
User enters: "password123"
              ↓
Backend receives: "password123"
              ↓
UserModel pre-save hook: bcrypt.hash()
              ↓
Stored in DB: "$2a$10$xY7zAb..."
              ↓
Login attempt: bcrypt.compare("password123", "$2a$10$xY7zAb...")
              ↓
Result: true/false
```

## Role-Based Redirects

After login, users are redirected based on role:
- `patient` → `/patient-dashboard`
- `doctor` → `/doctor/dashboard`
- `admin` → `/admin/dashboard`
- `pharmacist` → `/pharmacist-dashboard`
- `lab_technician` → `/lab-dashboard`

---

**Need Help?** Check the comprehensive docs:
- `AUTH_FLOW_SUMMARY.md` - Complete system overview
- `LOGIN_REGISTRATION_ANALYSIS.md` - Detailed analysis
- `CORS_FIX_README.md` - CORS configuration guide
