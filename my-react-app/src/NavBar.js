import React from "react";
import "./NavBar.css";

const Navbar = () => {
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

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}><a href="#products" style={{ color: "inherit", textDecoration: "none" }}>Products</a></li>
        <li style={styles.filterItem}><a href="#filter" style={{ color: "inherit", textDecoration: "none" }}>Filter</a></li>
        <li style={styles.navItem}><a href="#trends" style={{ color: "inherit", textDecoration: "none" }}>Trends</a></li>
      </ul>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          style={styles.searchInput}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          width="24px"
          height="24px"
          color="white"
          style={styles.searchIcon}
        >
          <path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm9.707 12.707-3.177-3.177a9 9 0 1 0-1.414 1.414l3.177 3.177a1 1 0 0 0 1.414-1.414Z" />
        </svg>      
      </div>
    </nav>
  );
};

export default Navbar;

