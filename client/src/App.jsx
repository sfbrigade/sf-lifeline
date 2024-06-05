import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login/login';
import { Layout } from './stories/Layout/Layout';

/**
 * Top-level application component.  *
 * @returns {React.ReactElement}
 */
function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
