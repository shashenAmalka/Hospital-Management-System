import './App.css';
import { Outlet } from 'react-router-dom';
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Clean up any potentially corrupted localStorage data on app start
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // If only one of the required items exists, clear both
    if ((userData && !token) || (!userData && token)) {
      console.log('Clearing incomplete session data');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    
    // Validate stored user data format
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (!parsedUser || typeof parsedUser !== 'object') {
          console.log('Clearing invalid user data');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.log('Clearing corrupted user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}

export default App;


