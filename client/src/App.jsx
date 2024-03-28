import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login';
import NavBar from './components/NavBar';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
