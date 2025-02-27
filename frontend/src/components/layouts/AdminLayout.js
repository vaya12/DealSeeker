import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Box,
    Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar 
                position="static" 
                sx={{ 
                    bgcolor: '#6CA390',
                    boxShadow: 'none'
                }}
            >
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            fontFamily: "'Saira Stencil One', sans-serif",
                            fontSize: '28px'
                        }}
                    >
                        DealSeeker Admin
                    </Typography>
                    <Button 
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{
                            fontFamily: "'Saira Stencil One', sans-serif",
                            fontSize: '16px'
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
            <Container component="main" sx={{ flex: 1, py: 3 }}>
                <Outlet />
            </Container>
            
            <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} DealSeeker Admin Panel
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default AdminLayout; 