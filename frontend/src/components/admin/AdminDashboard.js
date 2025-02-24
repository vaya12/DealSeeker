import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import MerchantsList from './MerchantsList';

const AdminDashboard = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary"
                        href="/admin/merchants/new"
                    >
                        Add New Merchant
                    </Button>
                </Box>

                <MerchantsList />
            </Box>
        </Container>
    );
};

export default AdminDashboard; 