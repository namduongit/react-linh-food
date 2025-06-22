import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell,
  TableHead, TableRow, TableFooter, TablePagination, Button, Box, Grid,
  TextField, MenuItem, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectFirestore } from '../../../firebase/config';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';
import { currencyFormat } from '../../../utils/currencyFormat';

const AdminMenu = () => {
  const [page, setPage] = useState(0);
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const [outOfStockDocs, setOutOfStockDocs] = useState([]);

  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  const [categories, setCategories] = useState({});
  const [units, setUnits] = useState({});

  const [openDialog, setOpenDialog] = useState(false);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClear = async (id) => {
    const confirm = await showNotification('Bạn có chắc chắn xóa thực đơn này ?');
    if (!confirm) return;
    await projectFirestore.collection('menu').doc(id).delete();
    toast({ title: 'Thông báo', message: `Xóa thực đơn thành công`, type: 'success', duration: 3000 });
  };

  const handleEdit = (id) => navigate(`/admin/edit-menu/${id}`);

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('menu')
      .orderBy('price', 'desc')
      .onSnapshot((snap) => {
        const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDocs(documents);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchKeys = async () => {
      const categorySnap = await projectFirestore.collection('categories').get();
      const unitSnap = await projectFirestore.collection('units').get();

      const categoryMap = {};
      categorySnap.docs.forEach(doc => {
        categoryMap[doc.id] = doc.data().value;
      });

      const unitMap = {};
      unitSnap.docs.forEach(doc => {
        unitMap[doc.id] = doc.data().value;
      });

      setCategories(categoryMap);
      setUnits(unitMap);
    };
    fetchKeys();
  }, []);

  useEffect(() => {
    const documents = docs.filter(doc => doc.quantity <= 0);
    setOutOfStockDocs(documents);
  }, [docs]);

  useEffect(() => {
    let temp = [...docs];
    if (nameFilter) {
      temp = temp.filter(item => item.name?.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (typeFilter) {
      temp = temp.filter(item => item.category === typeFilter);
    }
    if (unitFilter) {
      temp = temp.filter(item => item.unit === unitFilter);
    }
    setFilteredDocs(temp);
  }, [nameFilter, typeFilter, unitFilter, docs]);

  return (
    <Container sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý thực đơn
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm theo tên món"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Lọc theo danh mục"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(categories).map(([id, label]) => (
                <MenuItem key={id} value={id}>{label}</MenuItem>
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
              {Object.entries(units).map(([id, label]) => (
                <MenuItem key={id} value={id}>{label}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={() => navigate('/admin/key-manager')} sx={{ mr: 1 }}>
          Quản lý khóa
        </Button>
        {outOfStockDocs.length > 0 && (
          <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mr: 1 }}>
            Món hết hàng
          </Button>
        )}
        <Button variant="contained" onClick={() => navigate('/admin/add-menu')}>
          Thêm món
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell align="center">Tên</TableCell>
              <TableCell align="center">Ảnh</TableCell>
              <TableCell align="center">Ghi chú</TableCell>
              <TableCell align="center">Mô tả</TableCell>
              <TableCell align="center">Giá</TableCell>
              <TableCell align="center">Danh mục</TableCell>
              <TableCell align="center">Còn lại</TableCell>
              <TableCell align="center">Đơn vị</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocs.length > 0 ? (
              filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell align="center">{doc.name}</TableCell>
                  <TableCell align="center">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </TableCell>
                  <TableCell align="center">{doc.subtitle}</TableCell>
                  <TableCell align="center">{doc.description || 'Không có mô tả'}</TableCell>
                  <TableCell align="center">{currencyFormat(doc.price)}</TableCell>
                  <TableCell align="center">{categories[doc.category] || '---'}</TableCell>
                  <TableCell align="center">{doc.quantity}</TableCell>
                  <TableCell align="center">{units[doc.unit] || '---'}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(doc.id)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleClear(doc.id)}><ClearIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={9}>Không có thực đơn phù hợp</TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Các sản phẩm hết hàng</DialogTitle>
        <DialogContent dividers>
          <Typography>Các sản phẩm đang bán mà hết hàng sẽ không hiển thị</Typography>
          {outOfStockDocs.length > 0 ? (
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Tên món</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Giá bán</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outOfStockDocs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{categories[item.category] || item.category}</TableCell>
                    <TableCell>{currencyFormat(item.price)}</TableCell>
                    <TableCell>{item.availible ? 'Đang bán' : 'Dừng bán'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          ) : (
            <Typography>Không có dữ liệu chi tiết</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMenu;
