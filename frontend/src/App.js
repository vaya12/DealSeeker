import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/NavBar";
import Header from "./components/common/Header";
import Filter from "./components/common/Filter";
import Footer from "./components/common/Footer";
import Products from "./components/common/Products";
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AdminDashboard from './components/admin/AdminDashboard';
import MerchantForm from './components/admin/MerchantForm';
import AdminLayout from './components/layouts/AdminLayout';
import LoginForm from './components/admin/LoginForm';
import IconButton from '@mui/material/IconButton';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6ca390',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    brands: [],
    minPrice: 0,
    maxPrice: 300
  });

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar>
            <IconButton 
              color="inherit" 
              onClick={() => window.location.href = '/login'}
              sx={{ ml: 2 }}
              title="Admin Panel"
            >
              <AdminPanelSettingsIcon />
            </IconButton>
          </Navbar>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={
              <>
                <Header />
                <div style={{
                  display: 'flex',
                  padding: '20px',
                  maxWidth: '1400px',
                  margin: '0 auto',
                  gap: '30px'
                }}>
                  <div style={{ flex: '0 0 250px' }}>
                    <Filter onFilter={handleFilter} />
                  </div>
                  <div style={{ 
                    flex: '1',
                    maxWidth: 'calc(100% - 280px)'
                  }}>
                    <Products filters={filters} />
                  </div>
                </div>
              </>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="merchants/new" element={<MerchantForm />} />
              <Route path="merchants/:id/edit" element={<MerchantForm />} />
            </Route>

            <Route path="/products" element={<Products />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
