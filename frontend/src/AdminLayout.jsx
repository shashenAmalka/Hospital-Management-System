import './App.css';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Outlet />
    </div>
  );
}

export default AdminLayout;