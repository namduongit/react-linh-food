import {
  Container, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TablePagination,
  Grid, TextField, MenuItem, Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import { projectFirestore } from '../../../firebase/config';
import dayjs from 'dayjs';
import { currencyFormat } from '../../../utils/currencyFormat';

const AdminExport = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('exports')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let temp = [...data];
    if (typeFilter) {
      temp = temp.filter(item => item.type === typeFilter);
    }
    if (dateFilter) {
      temp = temp.filter(item =>
        dayjs(item.createdAt.toDate()).format('YYYY-MM-DD') === dateFilter
      );
    }
    setFiltered(temp);
  }, [data, typeFilter, dateFilter]);

  return (
    <Container>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý Phiếu Xuất / Hủy
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Lọc theo loại phiếu"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="cancel">Hủy hàng</MenuItem>
              <MenuItem value="discount">Bán giảm giá</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Lọc theo ngày"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setTypeFilter('');
                setDateFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Loại phiếu</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Giá gốc</TableCell>
              <TableCell>Giá sau giảm</TableCell>
              <TableCell>Thành tiền</TableCell>
              <TableCell>Lý do</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{dayjs(row.createdAt.toDate()).format('YYYY-MM-DD')}</TableCell>
                <TableCell>{row.type === 'cancel' ? 'Hủy hàng' : 'Bán giảm giá'}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>
                  {row.type === 'discount' ? currencyFormat(row.originalPrice) : '—'}
                </TableCell>
                <TableCell>
                  {row.type === 'discount' ? currencyFormat(row.finalPrice) : '—'}
                </TableCell>
                <TableCell>
                  {row.type === 'discount'
                    ? currencyFormat(row.finalPrice * row.quantity)
                    : '—'}
                </TableCell>
                <TableCell>{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, filtered.length]}
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang"
        />
      </TableContainer>
    </Container>
  );
};

export default AdminExport;
