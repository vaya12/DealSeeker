import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import MerchantsList from './MerchantsList';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import SyncIcon from '@mui/icons-material/Sync';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalMerchants: '-',
        totalProducts: '-',
        lastSync: null
    });

    const fetchStats = async () => {
        try {
            const merchantsResponse = await axios.get('http://localhost:3002/api/merchants');
            const totalMerchants = merchantsResponse.data.length;

            let totalProducts = 0;
            const productsResponse = await axios.get('http://localhost:3002/api/products');
            totalProducts = productsResponse.data.length;

            setStats({
                totalMerchants,
                totalProducts,
                lastSync: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{
                        fontFamily: "'Saira Stencil One', sans-serif",
                        fontSize: '32px',
                        mb: 3
                    }}
                >
                    Admin Dashboard
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexWrap: 'wrap',
                    mb: 4,
                    justifyContent: 'center'
                }}>
                    <Card sx={{ 
                        width: 180,
                        height: 140,
                        bgcolor: '#6CA390', 
                        color: 'white'
                    }}>
                        <CardContent sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            p: 2
                        }}>
                            <StorefrontIcon sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Total Merchants</Typography>
                            <Typography variant="h4" sx={{ fontSize: '28px' }}>{stats.totalMerchants}</Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ 
                        width: 180,
                        height: 140,
                        bgcolor: '#6CA390', 
                        color: 'white'
                    }}>
                        <CardContent sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            p: 2
                        }}>
                            <InventoryIcon sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Total Products</Typography>
                            <Typography variant="h4" sx={{ fontSize: '28px' }}>{stats.totalProducts}</Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ 
                        width: 180,
                        height: 140,
                        bgcolor: '#6CA390', 
                        color: 'white'
                    }}>
                        <CardContent sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            p: 2
                        }}>
                            <SyncIcon sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Last Sync</Typography>
                            <Typography variant="body1">
                                {stats.lastSync 
                                    ? new Date(stats.lastSync).toLocaleDateString()
                                    : 'Never'
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <MerchantsList onStatsChange={fetchStats} />
        </Container>
    );
};

export default AdminDashboard; 
