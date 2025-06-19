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


const AdminTotal = () => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [dineIn, setDineIn] = useState([]);
  const [bigTotalOrder, setBigTotalOrder] = useState(0);
  const [bigTotalDineIn, setBigTotalDineIn] = useState(0);
  const [bigTotal, setBigTotal] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDineInOrder, setSelectedDineInOrder] = useState(null);

  const [filterProduct, setFilterProduct] = useState('');
  const [sortBy, setSortBy] = useState('desc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const now = dayjs();
  const currentYear = now.year();
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState(now.month() + 1);
  const [filterYear, setFilterYear] = useState(currentYear);

  const navigate = useNavigate();


  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const generateYears = () => {
    const years = [];
    for (let y = currentYear - 10; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  };

  const getDateRange = () => {
    if (filterDay && filterMonth && filterYear) {
      const start = new Date(filterYear, filterMonth - 1, filterDay, 0, 0, 0);
      const end = new Date(filterYear, filterMonth - 1, filterDay, 23, 59, 59, 999);
      return { start, end };
    }

    if (filterMonth && filterYear) {
      const start = new Date(filterYear, filterMonth - 1, 1, 0, 0, 0);
      const end = new Date(filterYear, filterMonth, 0, 23, 59, 59, 999); // ngày cuối tháng
      return { start, end };
    }

    if (filterYear) {
      const start = new Date(filterYear, 0, 1, 0, 0, 0);
      const end = new Date(filterYear, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    return null;
  };


  const isWithinDateRange = (dateValue, range) => {
    let date;

    if (typeof dateValue === 'string') {
      const [time, datePart] = dateValue.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const [day, month, year] = datePart.split('/').map(Number);

      date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return false;
    }

    if (isNaN(date.getTime())) return false;

    return date >= range.start && date <= range.end;
  };


  const applyFilters = (data, range) => {
    let filtered = data.filter(doc => {
      if (range && !isWithinDateRange(doc.date, range)) {
        return false;
      }
      if (filterProduct) {
        const search = filterProduct.toLowerCase();
        const cart = doc.cart || [];
        const found = cart.some(item => {
          const name = item.name || item.subtitle || '';
          return name.toLowerCase().includes(search);
        });
        return found;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortBy === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  };


  const fetchData = async () => {
    const range = getDateRange();

    const [orderSnap, dineInSnap] = await Promise.all([
      projectFirestore.collection('order').where('checked', '==', true).get(),
      projectFirestore.collection('dinein').where('checked', '==', true).get()
    ]);

    const ordersRaw = orderSnap.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id };
    });
    const dineInRaw = dineInSnap.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id };
    });


    const filteredOrders = applyFilters(ordersRaw, range);
    const filteredDineIn = applyFilters(dineInRaw, range);

    setOrders(filteredOrders);
    setDineIn(filteredDineIn);

    const totalOrder = filteredOrders.reduce((sum, doc) => sum + (parseInt(doc.total) || 0), 0);
    const totalDineIn = filteredDineIn.reduce((sum, doc) => sum + (parseInt(doc.total) || 0), 0);

    setBigTotalOrder(totalOrder);
    setBigTotalDineIn(totalDineIn);
  };

  useEffect(() => {
    fetchData();
  }, [filterDay, filterMonth, filterYear, filterProduct, sortBy]);

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

      <Box component={Paper} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Ngày</InputLabel>
              <Select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                label="Ngày"
              >
                {filterMonth && filterYear &&
                  [...Array(getDaysInMonth(filterMonth, filterYear)).keys()].map((d) => (
                    <MenuItem key={d + 1} value={d + 1}>{d + 1}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Tháng</InputLabel>
              <Select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setFilterDay('');
                }}
                label="Tháng"
              >
                {[...Array(12).keys()].map((m) => (
                  <MenuItem key={m + 1} value={m + 1}>Tháng {m + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Năm</InputLabel>
              <Select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setFilterDay('');
                }}
                label="Năm"
              >
                {generateYears().map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
