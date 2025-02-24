import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import axios from 'axios';

const MerchantsList = () => {
    const [merchants, setMerchants] = useState([]);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        try {
            const response = await axios.get('/api/merchants');
            setMerchants(response.data);
        } catch (error) {
            console.error('Error fetching merchants:', error);
        }
    };

    const handleSyncClick = (merchant) => {
        setSelectedMerchant(merchant);
        setSyncDialogOpen(true);
    };

    const handleSyncConfirm = async () => {
        try {
            await axios.post(`/api/catalog/${selectedMerchant.id}/sync`);
            setSyncDialogOpen(false);
            // Обновяваме списъка след синхронизация
            fetchMerchants();
        } catch (error) {
            console.error('Error syncing products:', error);
        }
    };

    return (
        <>
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
                                    <Avatar src={merchant.logo} alt={merchant.name} />
                                </TableCell>
                                <TableCell>{merchant.name}</TableCell>
                                <TableCell>{merchant.description}</TableCell>
                                <TableCell>{merchant.catalog_url}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        href={`/admin/merchants/${merchant.id}/edit`}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleSyncClick(merchant)}
                                        color="secondary"
                                    >
                                        <SyncIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                    <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSyncConfirm} color="primary">
                        Sync Products
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MerchantsList; 