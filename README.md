# Hospital-Management-System
Hospital Management System -  MERN stack project
## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/shashenAmalka/Hospital-Management-System.git
cd Hospital-Management-System
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Then edit .env file with your actual values
```

Required environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate a random string)
- `PORT` - Server port (default: 5000)

### 4. Run the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Important Notes
⚠️ **Never commit `.env` files to Git!**
⚠️ **Always use strong, unique secrets for production!**