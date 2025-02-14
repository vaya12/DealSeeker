import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./styles/NavBar.css";
import { InputAdornment, TextField, Menu, MenuItem, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

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
    rightSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "15px",
      width: "50%",
      position: "relative",
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      maxWidth: "400px",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#fff",
        borderRadius: "25px",
        height: "35px",
        "& fieldset": {
          borderColor: "#6CA390",
          borderWidth: "2px",
        },
        "&:hover fieldset": {
          borderColor: "#6CA390",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#6CA390",
          borderWidth: "2px",
        },
        "& input": {
          color: "#000",
          padding: "8px 15px",
          "&::placeholder": {
            color: "#666",
            opacity: 1,
          },
        },
      },
      "& .MuiOutlinedInput-root.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#6CA390",
          borderWidth: "2px",
        },
      },
      "& .MuiInputBase-root": {
        "&.Mui-focused": {
          outline: "none",
        },
      },
    },
    profileIcon: {
      color: "white",
      fontSize: "2rem",
      cursor: "pointer",
    },
    menuItem: {
      fontSize: "16px",
      padding: "10px 20px",
      minWidth: "150px",
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return; 
    
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    
    navigate(`/products?search=${encodedQuery}`);
    
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
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

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileNavigate = () => {
    handleClose();
    navigate('/profile');
  };

  const handleAuthAction = () => {
    handleClose();
    if (user) {
      logout();
    } else {
      navigate('/login');
    }
  };

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link 
            to="/products" 
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
      
      <div style={styles.rightSection}>
        <form onSubmit={handleSearch} style={styles.searchContainer}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Search..."
            variant="outlined"
            size="small"
            sx={styles.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon 
                    style={{ color: "#6CA390", cursor: "pointer" }} 
                    onClick={handleSearch}
                  />
                </InputAdornment>
              ),
            }}
          />
        </form>
        
        <IconButton onClick={handleProfileClick}>
          <AccountCircleIcon sx={styles.profileIcon} />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileNavigate} sx={styles.menuItem}>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleAuthAction} sx={styles.menuItem}>
            {user ? 'Sign Out' : 'Log In'}
          </MenuItem>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;

