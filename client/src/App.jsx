import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages';
import Login from './pages/login';
import NavBar from './components/NavBar';

function App() {
  return (
    <>
      <NavBar />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
