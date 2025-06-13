//material-ui
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell,
  TableHead, TableRow, TableFooter, TablePagination, ButtonGroup, Button,
  Box, Grid, TextField, MenuItem, Typography, IconButton
} from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

//react
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

const AdminMenu = () => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  // Bộ lọc
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClear = async (id) => {
    const confirm = await showNotification('Bạn có chắc chắn xóa thực đơn này ?');
    if (!confirm) return;
    await projectFirestore.collection('menu').doc(id).delete();
    toast({
      title: 'Thông báo',
      message: `Xóa thực đơn ${id} thành công`,
      type: 'success',
      duration: 3000
    });
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-menu/${id}`);
  };

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('menu')
      .orderBy('price', 'desc')
      .onSnapshot((snap) => {
        const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDocs(documents);
      });
    return () => unsubscribe();
  }, []);

  // Apply filter
  useEffect(() => {
    let temp = [...docs];
    if (nameFilter) {
      temp = temp.filter(item => item.name?.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (typeFilter) {
      temp = temp.filter(item => item.type === typeFilter);
    }
    if (unitFilter) {
      temp = temp.filter(item => item.unit === unitFilter);
    }
    setFilteredDocs(temp);
  }, [nameFilter, typeFilter, unitFilter, docs]);

  // Lấy danh sách loại và đơn vị (nếu có nhiều)
  const typeOptions = [...new Set(docs.map(doc => doc.type).filter(Boolean))];
  const unitOptions = [...new Set(docs.map(doc => doc.unit).filter(Boolean))];

  return (
    <Container sx={{marginBottom: '20px'}}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý thực đơn
            </Typography>

      {/* Bộ lọc tìm kiếm */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm theo tên món"
              variant="outlined"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Lọc theo phân loại"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {typeOptions.map((type, i) => (
                <MenuItem key={i} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Lọc theo đơn vị"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {unitOptions.map((unit, i) => (
                <MenuItem key={i} value={unit}>{unit}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} textAlign="right">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setNameFilter('');
                setTypeFilter('');
                setUnitFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Nút Thêm thực đơn */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={() => navigate('/admin/add-menu')}>
          Thêm thực đơn
        </Button>
      </Box>

      {/* Bảng dữ liệu */}
      <TableContainer component={Paper} className={classes.container}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell align="center">Tên</TableCell>
              <TableCell align="center">Ảnh</TableCell>
              <TableCell align="center">Ghi chú</TableCell>
              <TableCell align="center">Mô tả</TableCell>
              <TableCell align="center">Đơn Giá</TableCell>
              <TableCell align="center">Danh mục</TableCell>
              <TableCell align="center">Phân loại</TableCell>
              <TableCell align="center">Đơn vị</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocs.length > 0 ? (
              filteredDocs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell align="center">{doc.name}</TableCell>
                    <TableCell align="center">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{doc.subtitle}</TableCell>
                    <TableCell align="center">{doc.description || 'Không có mô tả'}</TableCell>
                    <TableCell align="center">{currencyFormat(doc.price)}</TableCell>
                    <TableCell align="center">{doc.category}</TableCell>
                    <TableCell align="center">{doc.type}</TableCell>
                    <TableCell align="center">{doc.unit}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(doc.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleClear(doc.id)}>
                        <ClearIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={9}>
                  Không có thực đơn phù hợp
                </TableCell>
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

export default AdminMenu;
