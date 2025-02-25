import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Box 
} from '@mui/material';

const AdminLayout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        DealSeeker Admin
                    </Typography>
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