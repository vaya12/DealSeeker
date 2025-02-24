import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/NavBar";
import Header from "./components/common/Header";
import Filter from "./components/common/Filter";
import Footer from "./components/common/Footer";
import Products from "./components/common/Products";

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
          <Route path="/products" element={
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
          } />
          {/* <Route path="/catalog/{id}"
          >
            path="/catalog/:id" 
          </Route> */}

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
