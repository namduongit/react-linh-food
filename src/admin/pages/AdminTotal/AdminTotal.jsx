import {
  Typography, Table, TableContainer, Paper, TableBody,
  TableCell, TableHead, TableRow, TableFooter, TablePagination,
  Container, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl,
  InputLabel, Select, Grid, Box, Divider
} from '@mui/material';

import { useState, useEffect } from 'react';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';
import dayjs from 'dayjs';
import { useStyles } from './styles';

const AdminTotal = () => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [dineIn, setDineIn] = useState([]);
  const [bigTotalOrder, setBigTotalOrder] = useState(0);
  const [bigTotalDineIn, setBigTotalDineIn] = useState(0);
  const [bigTotal, setBigTotal] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDineInDialog, setOpenDineInDialog] = useState(false);
  const [selectedDineInOrder, setSelectedDineInOrder] = useState(null);

  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [sortBy, setSortBy] = useState('desc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOrders = projectFirestore.collection('order')
      .where('checked', '==', true)
      .onSnapshot(snap => {
        let docs = [];
        snap.forEach(doc => docs.push({ ...doc.data(), id: doc.id }));

        let filtered = docs;
        if (filterDate) {
          filtered = filtered.filter(doc =>
            dayjs(doc.date).isSame(dayjs(filterDate), 'day')
          );
        }

        if (filterProduct) {
          filtered = filtered.filter(doc =>
            doc.cart?.some(item =>
              (item.name || item.subtitle || '').toLowerCase().includes(filterProduct.toLowerCase())
            )
          );
        }

        filtered.sort((a, b) => sortBy === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
        );

        setOrders(filtered);
        const total = filtered.reduce((n, { total }) => n + parseInt(total || 0), 0);
        setBigTotalOrder(total);
      });

    const fetchDineIn = projectFirestore.collection('dinein')
      .where('checked', '==', true)
      .onSnapshot(snap => {
        let docs = [];
        snap.forEach(doc => docs.push({ ...doc.data(), id: doc.id }));

        let filtered = docs;
        if (filterDate) {
          filtered = filtered.filter(doc =>
            dayjs(doc.date).isSame(dayjs(filterDate), 'day')
          );
        }

        if (filterProduct) {
          filtered = filtered.filter(doc =>
            doc.cart?.some(item =>
              (item.name || item.subtitle || '').toLowerCase().includes(filterProduct.toLowerCase())
            )
          );
        }

        filtered.sort((a, b) => sortBy === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
        );

        setDineIn(filtered);
        const total = filtered.reduce((n, { total }) => n + parseInt(total || 0), 0);
        setBigTotalDineIn(total);
      });

    return () => {
      fetchOrders();
      fetchDineIn();
    };
  }, [filterDate, filterProduct, sortBy]);

  useEffect(() => {
    setBigTotal(bigTotalOrder + bigTotalDineIn);
  }, [bigTotalOrder, bigTotalDineIn]);

  const renderTable = (title, data, openDialogFunc) => (
    <Box my={3}>
      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
        {title}: {currencyFormat(data.reduce((n, i) => n + (parseInt(i.total) || 0), 0))} đ
      </Typography>
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Ngày</TableCell>
                <TableCell align="center">Tổng</TableCell>
                <TableCell align="center">Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell align="center">{doc.id}</TableCell>
                  <TableCell align="center">{doc.date}</TableCell>
                  <TableCell align="center">{currencyFormat(doc.total)} đ</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => openDialogFunc(doc)} variant="outlined" size="small">Chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(0);
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h4" align="left" sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}>
        Thống kê doanh thu
      </Typography>

      <Box component={Paper} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lọc theo ngày"
              type="date"
              fullWidth
              value={filterDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lọc theo món ăn"
              fullWidth
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="desc">Mới nhất</MenuItem>
                <MenuItem value="asc">Cũ nhất</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {renderTable('Tổng doanh thu đơn vận chuyển', orders, setSelectedOrder)}
      {renderTable('Tổng doanh thu đơn tại chỗ', dineIn, setSelectedDineInOrder)}

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" align="left" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Tổng doanh thu: {currencyFormat(bigTotal)} đ
      </Typography>

      {/* Dialogs */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết hóa đơn vận chuyển</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
              <Typography><strong>Ngày:</strong> {selectedOrder.date}</Typography>
              <Typography><strong>Tổng:</strong> {currencyFormat(selectedOrder.total)} đ</Typography>
              <Typography sx={{ mt: 2 }}><strong>Chi tiết món:</strong></Typography>
              <ul>
                {selectedOrder.cart?.map((item, i) => (
                  <li key={i}>{(item.name || item.subtitle || 'Món không rõ')} - {item.quantity} x {currencyFormat(item.price)} đ</li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedDineInOrder} onClose={() => setSelectedDineInOrder(null)} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết hóa đơn tại chỗ</DialogTitle>
        <DialogContent dividers>
          {selectedDineInOrder && (
            <Box>
              <Typography><strong>ID:</strong> {selectedDineInOrder.id}</Typography>
              <Typography><strong>Ngày:</strong> {selectedDineInOrder.date}</Typography>
              <Typography><strong>Tổng:</strong> {currencyFormat(selectedDineInOrder.total)} đ</Typography>
              <Typography sx={{ mt: 2 }}><strong>Chi tiết món:</strong></Typography>
              <ul>
                {selectedDineInOrder.cart?.map((item, i) => (
                  <li key={i}>{(item.name || item.subtitle || 'Món không rõ')} - {item.quantity} x {currencyFormat(item.price)} đ</li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDineInOrder(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTotal;