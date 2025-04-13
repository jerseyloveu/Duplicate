// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/JuanEMS/HomePage';
import SplashScreen from './components/JuanEMS/SplashScreen'; // Importing SplashScreen component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default Route (SplashScreen) */}
          <Route path="/" element={<SplashScreen />} />

          {/* Other routes */}
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
