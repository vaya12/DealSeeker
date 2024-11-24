import React from "react";

const Navbar = () => {
  const styles = {
    navbar: {
      display: "flex",
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
      gap: "40px",
      margin: 0,
      padding: 0,
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
      backgroundColor: "black",
      padding: "8px 10px",
      borderRadius: "15px",
      width: "50%", 
      marginLeft: "25%", 

    },
    searchInput: {
      border: "none",
      padding: "10px",
      fontSize: "18px",
      outline: "none",
      backgroundColor: "#fff8f8", 
      color: "black",
      borderRadius: "15px 0 0 15px",
      width: "75%", 
    },
    searchIcon: {
      color: "white",
      fontSize: "18px",
      marginLeft: "10px",
      cursor: "pointer",
    },
  };

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>Products</li>
        <li style={styles.filterItem}>Filter</li>
        <li style={styles.navItem}>Trends</li>
      </ul>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          style={styles.searchInput}
        />
        <i className="fas fa-search" style={styles.searchIcon}></i>
      </div>
    </nav>
  );
};

export default Navbar;
