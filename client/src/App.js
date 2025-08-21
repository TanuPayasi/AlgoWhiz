import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import TrackProblem from './pages/TrackProblem';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/problems" element={<PrivateRoute><ProblemList /></PrivateRoute>} />
          <Route path="/track" element={<PrivateRoute><TrackProblem /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;