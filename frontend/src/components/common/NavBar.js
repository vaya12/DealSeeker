import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Box,
  InputAdornment,
  Tooltip,
  styled,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(to left, black 50%, white 50%)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
}));

const NavLink = styled(Typography)(({ theme, color }) => ({
  fontSize: '28px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: color || 'black',
  fontFamily: "'Saira Stencil One', sans-serif",
  '&:hover': {
    opacity: 0.8,
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
  }
}));

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '25px',
    height: '35px',
    '& fieldset': {
      borderColor: '#6CA390',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#6CA390',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6CA390',
      borderWidth: '2px',
    },
    '& input': {
      color: '#000',
      padding: '8px 15px',
      '&::placeholder': {
        color: '#666',
        opacity: 1,
      },
    },
  },
});

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    navigate(`/products?search=${encodedQuery}`);
    setSearchQuery("");
    setMobileOpen(false);
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
    setMobileOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    setMobileOpen(false);
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
    setMobileOpen(false);
  };

  const navigationLinks = (
    <>
      <NavLink onClick={() => navigate('/products')}>Products</NavLink>
      <NavLink color="#6CA390" onClick={scrollToFilter}>Filter</NavLink>
      <NavLink onClick={handleHomeClick}>Home</NavLink>
    </>
  );

  const renderSearchBox = () => (
    <Box component="form" 
      onSubmit={handleSearch}
      sx={{ 
        flex: 1,
        maxWidth: '400px',
      }}
    >
      <SearchField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search..."
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  color: '#6CA390', 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }} 
                onClick={handleSearch}
              />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  return (
    <GradientAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        height: { xs: '60px', md: '70px' }, 
        px: { xs: 1, sm: 2 }
      }}>
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: 'black' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: { sm: '15px', md: '25px' } }}>
            {navigationLinks}
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: { xs: 'auto', md: '50%' },
          justifyContent: 'flex-end'
        }}>
          {!isMobile && (
            <Box sx={{ flex: 1, maxWidth: '400px' }}>
              {renderSearchBox()}
            </Box>
          )}

          <Tooltip title="Admin Access Only" arrow placement="bottom">
            <IconButton 
              onClick={handleProfileClick}
              sx={{ color: 'white' }}
            >
              <AccountCircleIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            bgcolor: 'white',
            p: 2
          }
        }}
      >
        <List>
          <ListItem onClick={() => navigate('/products')}>
            <ListItemText primary="Products" sx={{ 
              '& .MuiTypography-root': { 
                fontFamily: "'Saira Stencil One', sans-serif",
                fontSize: '20px'
              }
            }}/>
          </ListItem>
          <ListItem onClick={scrollToFilter}>
            <ListItemText primary="Filter" sx={{ 
              '& .MuiTypography-root': { 
                fontFamily: "'Saira Stencil One', sans-serif",
                fontSize: '20px',
                color: '#6CA390'
              }
            }}/>
          </ListItem>
          <ListItem onClick={handleHomeClick}>
            <ListItemText primary="Home" sx={{ 
              '& .MuiTypography-root': { 
                fontFamily: "'Saira Stencil One', sans-serif",
                fontSize: '20px'
              }
            }}/>
          </ListItem>
        </List>
        <Box sx={{ p: 2 }}>
          {renderSearchBox()}
        </Box>
      </Drawer>
    </GradientAppBar>
  );
};

export default Navbar;

