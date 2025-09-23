import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminLayout from './AdminLayout.jsx';
import './index.css';
import Login from "./Components/Login/Login.jsx";
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
import LeaveManagement from './Components/Admin/LeaveManagement.jsx';
import DoctorLayout from './Components/Doctor/DoctorLayout.jsx';
import ApplyForLeave from './Components/Doctor/ApplyForLeave.jsx';
import PharmacyItemForm from './Components/Pharmacy/PharmacyItemForm';
import PharmacistDashboard from './Components/Pharmacy/PharmacistDashboard';
import PharmacistLayout from './Components/Pharmacy/PharmacistLayout';
import LabTechnicianLayout from './Components/Laboratory/LabTechnicianLayout';
import LabRequestDetail from './Components/Laboratory/LabRequestDetail';
import LabReportCreation from './Components/Laboratory/LabReportCreation';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import ErrorPage from './Components/ErrorBoundary/ErrorPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { 
        path: "patient-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor', 'patient']}>
            <PatientDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "add-patient", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'doctor']}>
            <PatientForm />
          </PrivateRoute>
        )
      },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Register /> },
      { path: "about", element: <About /> },
    ],
  },
  {
    path: "/lab-technician",
    element: (
      <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
        <LabTechnicianLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/lab-technician-dashboard",
    element: <Navigate to="/lab-technician" replace />,
    errorElement: <ErrorPage />
  },
  {
    path: "/lab-technician/lab-requests/:id",
    element: (
      <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
        <LabRequestDetail />
      </PrivateRoute>
    )
  },
  {
    path: "/lab-report-creation/:labRequestId",
    element: (
      <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
        <LabReportCreation />
      </PrivateRoute>
    )
  },
  {
    path: "/lab-technician/notifications",
    element: (
      <PrivateRoute allowedRoles={['admin', 'lab_technician']}>
        <LabTechnicianLayout />
      </PrivateRoute>
    )
  },
  {
    path: "/pharmacist-dashboard",
    element: (
      <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
        <PharmacistLayout />
      </PrivateRoute>
    )
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { 
        path: "dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "leave-management", 
        element: (
          <PrivateRoute allowedRoles={['admin']}>
            <LeaveManagement />
          </PrivateRoute>
        )
      },
    ],
  },
  {
    path: "/doctor",
    element: <AdminLayout />,
    children: [
      { 
        path: "dashboard", 
        element: (
          <PrivateRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </PrivateRoute>
        )
      },
      { 
        path: "apply-for-leave", 
        element: (
          <PrivateRoute allowedRoles={['doctor']}>
            <ApplyForLeave />
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
      /* Old lab-dashboard route removed as it's now at /lab-technician */
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
    ],
  },
  {
    path: "/pharmacist",
    element: <PharmacistLayout />,
    children: [
      { 
        path: "dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacistDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "items", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacistDashboard />
          </PrivateRoute>
        )
      },
      { 
        path: "items/add", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacyItemForm />
          </PrivateRoute>
        )
      },
      { 
        path: "items/edit/:id", 
        element: (
          <PrivateRoute allowedRoles={['admin', 'pharmacist']}>
            <PharmacyItemForm />
          </PrivateRoute>
        )
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);