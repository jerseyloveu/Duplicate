// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importing necessary components from react-router-dom
import HomePage from './components/HomePage'; // Importing HomePage component

function App() {
  return (
    <Router> {/* Wrap the app with BrowserRouter */}
      <div className="App">
        <Routes>
          {/* Default Route (Home Page) */}
          <Route path="/" element={<HomePage />} /> {/* Set '/' as the default route for HomePage */}
          
          {/* Other routes */}
          <Route path="/home" element={<HomePage />} /> {/* You can keep this as well if you want '/home' to work too */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
