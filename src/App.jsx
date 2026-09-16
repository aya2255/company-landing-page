import './App.css';
import {useState} from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Sats from './components/Sats';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ContentManagement from './components/ContentManagement';
import Auth from './components/Auth';


function App() {
  const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);

const handleLogin = (userData) => {
  setUser(userData);
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
};
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <WhyUs />
      <Sats />
      <Contact />

<Auth onLogin={handleLogin} />

{user && <ContentManagement />}

{user && (
  <button className="logout-button" onClick={handleLogout}>
    Logout
  </button>
)}

<Footer />
      
    </div>
  );
}
export default App;