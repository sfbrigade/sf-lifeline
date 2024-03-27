import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login';
import { Layout } from './stories/Layout/Layout';

/**
 * Top-level application component.  *
 * @returns {React.ReactElement}
 */
function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
