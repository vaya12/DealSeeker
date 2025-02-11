import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import api from '../../services/api';

const CatalogReview = () => {
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');

    const fetchCatalogs = async () => {
        try {
            const response = await api.get('/catalog/pending');
            setCatalogs(response.data);
        } catch (err) {
            setError('Error loading catalogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalogs();
    }, []);

    const handleReview = async (status) => {
        try {
            await api.post(`/catalog/${selectedCatalog.id}/review`, {
                status,
                notes: reviewNotes
            });

            fetchCatalogs();
            setSelectedCatalog(null);
            setReviewNotes('');
        } catch (err) {
            setError('Error processing review');
        }
    };

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Pending Catalogs
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Merchant</TableCell>
                            <TableCell>Store</TableCell>
                            <TableCell>Upload Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {catalogs.map((catalog) => (
                            <TableRow key={catalog.id}>
                                <TableCell>{catalog.merchant_name}</TableCell>
                                <TableCell>{catalog.store_name}</TableCell>
                                <TableCell>
                                    {new Date(catalog.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelectedCatalog(catalog)}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!selectedCatalog} onClose={() => setSelectedCatalog(null)}>
                <DialogTitle>Review Catalog</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Review Notes"
                        multiline
                        rows={4}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCatalog(null)}>Cancel</Button>
                    <Button 
                        onClick={() => handleReview('rejected')}
                        color="error"
                    >
                        Reject
                    </Button>
                    <Button 
                        onClick={() => handleReview('approved')}
                        color="primary"
                        variant="contained"
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CatalogReview; 