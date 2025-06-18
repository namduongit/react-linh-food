import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell,
  TableHead, TableRow, TableFooter, TablePagination, Button, Box, Grid, TextField,
  MenuItem, Typography, IconButton
} from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

const AdminInbound = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  // Bộ lọc
  const [nameFilter, setNameFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id, status) => {
    if (status === 'Đã hoàn thành') {
      toast({ title: 'Không thể xóa', message: 'Phiếu đã hoàn thành không thể xóa.', type: 'warning' });
      return;
    }

    const confirm = await showNotification('Bạn có chắc chắn xóa phiếu nhập này?');
    if (!confirm) return;

    await projectFirestore.collection('inbounds').doc(id).delete();
    toast({ title: 'Thành công', message: 'Đã xóa phiếu nhập.', type: 'success' });
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-inbound/${id}`);
  };

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('inbounds')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap) => {
        const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDocs(documents);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let temp = [...docs];
    if (nameFilter) {
      temp = temp.filter(item => item.productName?.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (dateFilter) {
      temp = temp.filter(item => dayjs(typeof item.createdAt?.toDate === 'function' ? item.createdAt.toDate() : item.createdAt).format('YYYY-MM-DD') === dateFilter);
    }
    if (sortOrder === 'asc') {
      temp.sort((a, b) => a.total - b.total);
    } else if (sortOrder === 'desc') {
      temp.sort((a, b) => b.total - a.total);
    }
    setFilteredDocs(temp);
  }, [nameFilter, sortOrder, dateFilter, docs]);

  return (
    <Container sx={{ marginBottom: '20px' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý phiếu nhập
      </Typography>

      {/* Bộ lọc */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm theo tên sản phẩm"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Lọc theo ngày (YYYY-MM-DD)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Sắp xếp theo tổng tiền"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="">Mặc định</MenuItem>
              <MenuItem value="asc">Tăng dần</MenuItem>
              <MenuItem value="desc">Giảm dần</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} textAlign="right">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setNameFilter('');
                setDateFilter('');
                setSortOrder('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Nút Thêm phiếu nhập */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={() => navigate('/admin/add-inbound')}>
          Thêm phiếu nhập
        </Button>
      </Box>

      {/* Bảng */}
      <TableContainer component={Paper} className={classes.container}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell align="center">Tên sản phẩm</TableCell>
              <TableCell align="center">Ngày nhập</TableCell>
              <TableCell align="center">Tổng tiền</TableCell>
              <TableCell align="center">Người tạo</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocs.length > 0 ? (
              filteredDocs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell align="center">{doc.productName}</TableCell>
                    <TableCell align="center">
                      {dayjs(doc.createdAt?.toDate?.() || doc.createdAt).format('YYYY-MM-DD')}
                    </TableCell>
                    <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                    <TableCell align="center">{doc.createdBy}</TableCell>
                    <TableCell align="center">{doc.status}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(doc.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doc.id, doc.status)}
                        disabled={doc.status === 'Đã hoàn thành'}
                      >
                        <ClearIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">Không có phiếu nhập phù hợp</TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15, filteredDocs.length]}
                count={filteredDocs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số dòng mỗi trang"
              />
            </TableRow>
          </TableFooter>
        </MuiTable>
      </TableContainer>
    </Container>
  );
};

export default AdminInbound;
