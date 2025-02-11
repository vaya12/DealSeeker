import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/NavBar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const styles = {
    navbar: {
      display: "flex",
      height: "70px",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      backgroundColor: "white",
      background: "linear-gradient(to left, black 50%, white 50%)", 
      fontFamily: "'Saira Stencil One', sans-serif",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    navList: {
      display: "flex",
      listStyle: "none",
      gap: "25px",
      margin: 0,
      padding: 0,
      flexWrap: "wrap",
    },
    navItem: {
      fontSize: "28px",
      fontWeight: "bold",
      cursor: "pointer",
      color: "black",
    },
    filterItem: {
      fontSize: "28px",
      fontWeight: "bold",
      cursor: "pointer",
      color: "#6CA390", 
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      padding: "8px 10px",
      borderRadius: "15px",
      width: "80%", 
      maxWidth: "600px",
      margin: 0,
    },
    searchInput: {
      border: "none",
      padding: "10px",
      fontSize: "18px",
      outline: "none",
      backgroundColor: "#fff8f8", 
      color: "#6CA390",
      borderRadius: "15px 0 0 15px",
      width: "80%", 
    },
    searchIcon: {
      color: "pink",
      fontSize: "18px",
      marginLeft: "10px",
      cursor: "pointer",
    },
  };

  const scrollToFilter = () => {
    const filterElement = document.querySelector('.filter-section');
    if (filterElement) {
      filterElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link 
            to="/products" 
            target="_blank"
            state={{ showFilter: true }}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Products
          </Link>
        </li>
        <li style={styles.filterItem}>
          <span 
            onClick={scrollToFilter} 
            style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
          >
            Filter
          </span>
        </li>
        <li style={styles.navItem}>
          <span 
            onClick={handleHomeClick}
            style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
          >
            Home
          </span>
        </li>
      </ul>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          style={styles.searchInput}
        />
      </div>
    </nav>
  );
};

export default Navbar;

