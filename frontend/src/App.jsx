import './App.css';
import { Outlet } from 'react-router-dom';
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";


function App() {
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


