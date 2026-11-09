import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AddProduct from './pages/AddProduct';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import UserList from './pages/UserList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const theme = {
    primary: '#333',
    secondary: Math.random() > 0.5 ? '#f5f5f5' : '#f6f6f6'
  };

  const refreshAuth = React.useCallback(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  return (
    <BrowserRouter>
      <div
        style={{
          backgroundColor: theme.secondary,
          padding: '20px'
        }}
      >
        {isAuthenticated && <Navigation onLogout={refreshAuth} />}
        <Routes>
          <Route element={<Login onLogin={refreshAuth} />} path="/login" />
          <Route element={<Register />} path="/register" />
          <Route
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
            path="/users"
          />
          <Route
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
            path="/products"
          />
          <Route
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
            path="/add-product"
          />
          <Route
            element={isAuthenticated ? <Navigate replace to="/products" /> : <Navigate replace to="/login" />}
            path="/"
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
