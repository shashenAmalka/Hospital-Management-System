import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Login from "./Components/Login/login.jsx";
import Register from "./Components/Register/Register.jsx";
import About from "./Components/About/About.jsx";
import Contact from "./Components/ContactUs/Contact.jsx";
import PatientDashboard from "./Components/PatientDashboard/PatientDashboard.jsx";
import PatientForm from "./Components/PatientForm/PatientForm.jsx";
import Home from "./Components/Home/Home.jsx";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import UserManagement from './Components/Admin/UserManagement.jsx';
import AdminDashboard from './Components/Admin/AdminDashboard.jsx';
import DoctorDashboard from './Components/Dashboard/DoctorDashboard.jsx';
import PharmacistDashboard from './Components/Dashboard/PharmacistDashboard.jsx';
import LabTechnicianDashboard from './Components/Dashboard/LabTechnicianDashboard.jsx';
import StaffDashboard from './Components/Dashboard/StaffDashboard.jsx';
import ErrorBoundary from './Components/ErrorBoundary.jsx';
import PharmacyItemForm from './Components/Pharmacy/PharmacyItemForm';

// Create a root ErrorBoundary that doesn't use Router hooks
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Root error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Application Error</h2>
            <p className="text-gray-600 mb-6 text-center">
              The application failed to load properly. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary navigateOnReset={true} />,
    children: [
      { index: true, element: <Home /> },
      { 
        path: "patient-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <PatientDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "add-patient", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor', 'staff']}>
            <PatientForm />
          </PrivateRoute>
        )
      },
      { 
        path: "admin-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "doctor-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "pharmacist-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['pharmacist']}>
            <PharmacistDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "lab-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['lab_technician']}>
            <LabTechnicianDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "staff-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "user-management", 
        element: (
          <PrivateRoute allowedRoles={['admin']}>
            <UserManagement />
          </PrivateRoute>
        )
      },
      { 
        path: "doctors", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor', 'staff']}>
            <div>Doctors & Staff Page</div>
          </PrivateRoute>
        )
      },
      { 
        path: "appointments", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor', 'staff', 'patient']}>
            <div>Appointments Page</div>
          </PrivateRoute>
        )
      },
      { 
        path: "inventory", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <div>Inventory & Pharmacy Page</div>
          </PrivateRoute>
        )
      },
      { 
        path: "laboratory", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
            <div>Laboratory Page</div>
          </PrivateRoute>
        )
      },
      { 
        path: "pharmacy/items/add", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacyItemForm />
          </PrivateRoute>
        )
      },
      { 
        path: "pharmacy/items/edit/:id", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacyItemForm />
          </PrivateRoute>
        )
      },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Register /> },
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <RouterProvider router={router} />
    </RootErrorBoundary>
  </React.StrictMode>
);