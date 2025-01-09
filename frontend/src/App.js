import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Header from "./Header";
import Filter from "./Filter";
import Footer from "./Footer";
import Products from "./Products";

function App() {
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    brands: [],
    maxPrice: 1000
  });

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
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
          <Route path="/products" element={<Products filters={filters} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
