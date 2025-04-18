// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/JuanEMS/HomePage';
import SplashScreen from './components/JuanEMS/SplashScreen';
import Register from './components/JuanScope/Register'; // Add this import
import Register2 from './components/JuanScope/Register2'
import Register3 from './components/JuanScope/Register3';
import VerifyEmail from './components/JuanScope/VerifyEmail';
import ScopeLogin from './components/JuanScope/ScopeLogin';


import Admin_LoginPage from './components/UserAdmin/LoginPage'; 
import Admin_DashboardPage from './components/UserAdmin/DashboardPage'; 
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default Route (SplashScreen) */}
          <Route path="/" element={<SplashScreen />} />

          {/* Other routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<Register />} /> 
          <Route path="/register2" element={<Register2 />} /> 
          <Route path="/register3" element={<Register3 />} /> 
          <Route path="/verify-email" element={<VerifyEmail />} /> 
          <Route path="/scope-login" element={<ScopeLogin />} /> 
          <Route path="/register" element={<Register />} /> {/* Add this new route */}
          <Route path='/admin' element={<Admin_LoginPage/>}/>
          <Route path='/admin/dashboard' element={<Admin_DashboardPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

