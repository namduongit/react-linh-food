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

import { useNavigate } from 'react-router-dom';

import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';


const AdminTotal = () => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [dineIn, setDineIn] = useState([]);

  const [filterOrders, setFilterOrders] = useState([])
  const [filterDineIn, setFilterDineIn] = useState([])

  const [bigTotalOrder, setBigTotalOrder] = useState(0);
  const [bigTotalDineIn, setBigTotalDineIn] = useState(0);

  const [bigTotal, setBigTotal] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDineInOrder, setSelectedDineInOrder] = useState(null);


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubOrder = projectFirestore.collection('order')
      .where('status', '==', 'Đã hoàn thành')
      .onSnapshot(snap => setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const unsubDine = projectFirestore.collection('dinein')
      .where('status', '==', 'Đã hoàn thành')
      .onSnapshot(snap => setDineIn(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => {
      unsubOrder();
      unsubDine();
    }
  }, []);


  const isInDateRangle = (strDate) => {
    const date = new Date(strDate);
    const start = new Date(fromDate + 'T00:00:00');
    const end = new Date(toDate + 'T23:59:59');
    return date && date >= start && date <= end;
  }


  const handleAnalyze = () => {
    if (!fromDate || !toDate) {
      toast({
        title: 'Thông báo', message: 'Vui lòng chọn ngày phù hợp', type: 'warning', duration: 30000
      })
      return
    }

    const orderData = orders.filter(doc => isInDateRangle(doc.date));
    const dineInData = dineIn.filter(doc => isInDateRangle(doc.date));

    setFilterOrders(orderData);
    setFilterDineIn(dineInData);

    const orderTotal = orderData.reduce((sum, item) => sum + (parseInt(item.total) || 0), 0);
    const dineInTotal = dineInData.reduce((sum, item) => sum + (parseInt(item.total) || 0), 0);

    setBigTotalOrder(orderTotal);
    setBigTotalDineIn(dineInTotal);


  }

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
                  <TableCell align="center"> {new Date(doc.date).toLocaleString('vi-VN')}</TableCell>
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
      <Box sx={{ mb: 2, textAlign: 'left' }}>
        <Button variant="contained" onClick={() => {
          navigate(`/admin/profit`);
        }}>
          Thống kê lợi nhuận
        </Button>
      </Box>

      <Box component={Paper} sx={{ p: 3, mb: 4 }} display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField label="Từ ngày" type="date" InputLabelProps={{ shrink: true }}
          value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

        <TextField label="Đến ngày" type="date" InputLabelProps={{ shrink: true }}
          value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button variant="contained" onClick={handleAnalyze}>Thống kê</Button>
      </Box>

      {renderTable('Tổng doanh thu đơn vận chuyển', filterOrders, setSelectedOrder)}
      {renderTable('Tổng doanh thu đơn tại chỗ', filterDineIn, setSelectedDineInOrder)}

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" align="left" sx={{ fontWeight: 'bold', mb: 2 }}>
        Tổng doanh thu: {currencyFormat(bigTotal)} đ
      </Typography>

      {/* Dialogs */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết hóa đơn vận chuyển</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
              <Typography><strong>Ngày:</strong> {dayjs(selectedOrder.date.toDate?.() || selectedOrder.date).format('DD/MM/YYYY HH:mm')}</Typography>
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
              <Typography><strong>Ngày:</strong> {dayjs(selectedDineInOrder.date.toDate?.() || selectedDineInOrder.date).format('DD/MM/YYYY HH:mm')}</Typography>
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
