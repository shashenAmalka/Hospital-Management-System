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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
      { 
        path: "admin-dashboard", 
        element: (
          <PrivateRoute allowedRoles={['admin']}>
            <UserManagement />
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
    <RouterProvider router={router} />
  </React.StrictMode>
);