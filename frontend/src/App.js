import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';

// Item Components
import Items from './components/items/Items';
import ItemDetail from './components/items/ItemDetail';
import AddItem from './components/items/AddItem';
import EditItem from './components/items/EditItem';
import MyItems from './components/items/MyItems';

// Claim Components
import Claims from './components/claims/Claims';

import ClaimDetail from './components/claims/ClaimDetail';
import AddClaim from './components/claims/AddClaim';

// Notification Components
import Notifications from './components/notifications/Notifications';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ItemManagement from './components/admin/ItemManagement';
import ClaimManagement from './components/admin/ClaimManagement';

// Context
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 py-4">
            <div className="container">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/items" element={<Items />} />
                <Route path="/items/:id" element={<ItemDetail />} />
                
                {/* Private Routes */}
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/items/add" element={<PrivateRoute><AddItem /></PrivateRoute>} />
                <Route path="/items/edit/:id" element={<PrivateRoute><EditItem /></PrivateRoute>} />
                <Route path="/my-items" element={<PrivateRoute><MyItems /></PrivateRoute>} />
                <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />                <Route path="/claims/:id" element={<PrivateRoute><ClaimDetail /></PrivateRoute>} />
                <Route path="/items/:id/claim" element={<PrivateRoute><AddClaim /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/items" element={<AdminRoute><ItemManagement /></AdminRoute>} />
                <Route path="/admin/claims" element={<AdminRoute><ClaimManagement /></AdminRoute>} />
              </Routes>
            </div>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
