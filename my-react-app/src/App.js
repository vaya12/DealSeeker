import './App.css';
import React from "react";
import Navbar from "./NavBar";
import Header from "./Header";
import Filter from "./Filter";
import Footer from "./Footer";


function App() {
  return (
    <div className="App">
      <Navbar />
      <Header />
      <Filter />
      <Footer />
    </div>
  );
}

export default App;

