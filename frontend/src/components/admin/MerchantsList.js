import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Avatar,
    Box,
    Typography,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import { merchantApi } from '../../services/api';

const MerchantsList = ({ onStatsChange }) => {
    const navigate = useNavigate();
    const [merchants, setMerchants] = useState([]);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [loading, setLoading] = useState(false);

    const fetchMerchants = useCallback(async () => {
        try {
            setLoading(true);
            const response = await merchantApi.getAll();
            setMerchants(response.data);
        } catch (error) {
            console.error('Error fetching merchants:', error);
            showSnackbar('Failed to load merchants', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMerchants();
    }, [fetchMerchants]);

    const handleSyncClick = (merchant) => {
        setSelectedMerchant(merchant);
        setSyncDialogOpen(true);
    };

    const handleDeleteClick = (merchant) => {
        setSelectedMerchant(merchant);
        setDeleteDialogOpen(true);
    };

    const handleSyncConfirm = async () => {
        try {
            setLoading(true);
            const response = await merchantApi.sync(selectedMerchant.id);
            
            if (response.error) {
                showSnackbar(response.error, 'error');
            } else {
                showSnackbar(`Successfully synchronized ${response.productsCount || 0} products`);
                await fetchMerchants();
                onStatsChange();
            }
        } catch (error) {
            console.error('Error syncing products:', error);
            const errorMessage = error.response?.data?.error || 
                               error.message || 
                               'Failed to sync products. Please try again.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
            setSyncDialogOpen(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await merchantApi.delete(selectedMerchant.id);
            setDeleteDialogOpen(false);
            showSnackbar('Merchant deleted successfully');
            await fetchMerchants();
            onStatsChange();
        } catch (error) {
            console.error('Error deleting merchant:', error);
            showSnackbar('Failed to delete merchant', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    return (
        <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{
                        fontFamily: "'Saira Stencil One', sans-serif",
                        fontSize: '24px'
                    }}
                >
                    Merchants
                </Typography>
                <Button
                    variant="contained"
                    sx={{ 
                        bgcolor: '#6CA390',
                        color: '#ffffff',
                        '&:hover': {
                            bgcolor: '#5b8c7d'
                        }
                    }}
                    onClick={() => navigate('/admin/merchants/new')}
                >
                    Add New Merchant
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress sx={{ color: '#6CA390' }} />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Logo</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Catalog URL</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {merchants.map((merchant) => (
                                <TableRow key={merchant.id}>
                                    <TableCell>
                                        <Avatar 
                                            src={merchant.logo} 
                                            alt={merchant.name}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    </TableCell>
                                    <TableCell>{merchant.name}</TableCell>
                                    <TableCell>{merchant.description}</TableCell>
                                    <TableCell>{merchant.catalog_url}</TableCell>
                                    <TableCell>
                                        <IconButton 
                                            onClick={() => navigate(`/admin/merchants/${merchant.id}/edit`)}
                                            color="primary"
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleSyncClick(merchant)}
                                            color="secondary"
                                            title="Sync Products"
                                        >
                                            <SyncIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleDeleteClick(merchant)}
                                            color="error"
                                            title="Delete"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={syncDialogOpen}
                onClose={() => setSyncDialogOpen(false)}
            >
                <DialogTitle>Confirm Sync</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to sync products for {selectedMerchant?.name}? 
                        This will delete all existing products for this merchant and import new ones.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setSyncDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSyncConfirm} 
                        color="primary" 
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sync Products'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedMerchant?.name}? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MerchantsList;