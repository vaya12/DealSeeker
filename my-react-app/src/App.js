import './App.css';
import React from "react";
import Navbar from "./NavBar";
import Header from "./Header";
import Filter from "./Filter";
import Footer from "./Footer";
import Products from "./Products";



function App() {
  return (
    <div className="App">
      <Navbar />
      <Header />
      <Filter />
      <Products />
      <Footer />
      
    </div>
  );
}

export default App;

