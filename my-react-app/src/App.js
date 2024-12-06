import './App.css';
import React from "react";
import Navbar from "./NavBar";
import Header from "./Header";
import Filter from "./Filter";


function App() {
  return (
    <div className="App">
      <Navbar />
      <Header />
      <Filter />
    </div>
  );
}

export default App;

