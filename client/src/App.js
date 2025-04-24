import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Spin } from 'antd';
import Dashboard from './pages/Dashboard/Dashboard';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MainLayout from './components/Layout/MainLayout';
import { checkAuth } from './redux/slices/authSlice';
import './styles/App.css';

const { Content } = Layout;

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'accountant']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App; 