import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { catalogService } from '../../services/catalogService';

const CatalogReview = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  useEffect(() => {
    loadPendingCatalogs();
  }, []);

  const loadPendingCatalogs = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getPendingCatalogs();
      setCatalogs(data);
    } catch (err) {
      setError('Error loading catalogs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (catalog, approved) => {
    setSelectedCatalog({ ...catalog, approved });
    setOpenDialog(true);
  };

  const handlePreview = (catalog) => {
    setSelectedCatalog(catalog);
    setOpenPreview(true);
  };

  const submitReview = async () => {
    try {
      await catalogService.submitReview(selectedCatalog.id, {
        status: selectedCatalog.approved ? 'approved' : 'rejected',
        notes: reviewNotes
      });
      
      setOpenDialog(false);
      setReviewNotes('');
      loadPendingCatalogs(); 
    } catch (err) {
      setError('Error submitting review: ' + err.message);
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      approved: 'success',
      rejected: 'error'
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={statusColors[status] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Catalog Review
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Merchant</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Products</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : catalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No pending catalogs</TableCell>
              </TableRow>
            ) : (
              catalogs.map((catalog) => (
                <TableRow key={catalog.id}>
                  <TableCell>{catalog.merchantName}</TableCell>
                  <TableCell>
                    {new Date(catalog.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusChip(catalog.status)}</TableCell>
                  <TableCell>{catalog.productCount}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview Catalog">
                      <IconButton
                        onClick={() => handlePreview(catalog)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Approve">
                      <IconButton
                        onClick={() => handleReview(catalog, true)}
                        color="success"
                        size="small"
                      >
                        <ApproveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        onClick={() => handleReview(catalog, false)}
                        color="error"
                        size="small"
                      >
                        <RejectIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedCatalog?.approved ? 'Approve' : 'Reject'} Catalog
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Review Notes"
            fullWidth
            multiline
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={submitReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Catalog Preview</DialogTitle>
        <DialogContent>
          {selectedCatalog && (
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(selectedCatalog.preview, null, 2)}
            </pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogReview; 