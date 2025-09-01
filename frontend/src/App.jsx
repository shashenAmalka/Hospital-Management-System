import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

function App() {
  const location = useLocation();
  
  // Check if current route is an admin dashboard or related admin route
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard') || 
                      location.pathname.startsWith('/admin/') ||
                      location.pathname === '/admin';
  
  // Check if current route is a staff dashboard
  const isStaffRoute = location.pathname.startsWith('/staff-dashboard') || 
                      location.pathname.startsWith('/staff/');
  
  // Check if current route is a doctor dashboard
  const isDoctorRoute = location.pathname.startsWith('/doctor-dashboard') || 
                       location.pathname.startsWith('/doctor/');
  
  // Check if current route is a lab technician dashboard
  const isLabTechRoute = location.pathname.startsWith('/lab-dashboard') || 
                        location.pathname.startsWith('/lab/');
  
  // Check if current route is a pharmacist dashboard
  const isPharmacistRoute = location.pathname.startsWith('/pharmacist-dashboard') || 
                           location.pathname.startsWith('/pharmacist/');
  
  // Combine all dashboard routes where header/footer should be hidden
  const isDashboardRoute = isAdminRoute || isStaffRoute || isDoctorRoute || 
                          isLabTechRoute || isPharmacistRoute;
  
  // Check if current route is a patient route (where footer should be shown)
  const isPatientRoute = location.pathname.startsWith('/patient') || 
                        location.pathname === '/patient-dashboard';

  return (
    <div>
      {/* Show header only for non-dashboard routes */}
      {!isDashboardRoute && <Header />}
      
      <Outlet />
      
      {/* Show footer only for patient routes that aren't dashboards */}
      {isPatientRoute && !isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;