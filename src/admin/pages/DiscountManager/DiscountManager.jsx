import {
  Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell,
  TableHead, TableRow, TableFooter, TablePagination, Button, Box, Typography,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';
import { currencyFormat } from '../../../utils/currencyFormat';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';

const DiscountManager = () => {
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('discounts').onSnapshot(snap => {
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setDocs(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await showNotification('Bạn có chắc chắn muốn xóa sản phẩm giảm giá này?');
    if (!confirm) return;
    await projectFirestore.collection('discounts').doc(id).delete();
    toast({ title: 'Thông báo', message: 'Đã xóa sản phẩm giảm giá', type: 'success', duration: 3000 });
  };


  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  return (
    <Container sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý sản phẩm giảm giá
      </Typography>

      {/* <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={() => navigate('/admin/add-discount')}>
          Thêm sản phẩm giảm giá
        </Button>
      </Box> */}

      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell align="center">Tên</TableCell>
              <TableCell align="center">Ảnh</TableCell>
              <TableCell align="center">Giảm (%)</TableCell>
              <TableCell align="center">Giá sau giảm</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.length > 0 ? (
              docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(doc => (
                <TableRow key={doc.id}>
                  <TableCell align="center">{doc.name || doc.subtitle || '---'}</TableCell>
                  <TableCell align="center">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </TableCell>
                  <TableCell align="center">{doc.discount}%</TableCell>
                  <TableCell align="center">{currencyFormat(doc.price)} đ</TableCell>
                  <TableCell align="center">{doc.quantity}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}><ClearIcon /></IconButton>
                    {/* <Button size="small" onClick={() => handleViewDetail(doc)}>Chi tiết</Button> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={6}>Không có sản phẩm giảm giá</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                count={docs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              />
            </TableRow>
          </TableFooter>
        </MuiTable>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết sản phẩm giảm giá</DialogTitle>
        <DialogContent dividers>
          {selectedItem ? (
            <>
              <Typography><strong>Tên:</strong> {selectedItem.name || selectedItem.subtitle}</Typography>
              <Typography><strong>Giảm:</strong> {selectedItem.discount}%</Typography>
              <Typography><strong>Giá sau giảm:</strong> {currencyFormat(selectedItem.price)} đ</Typography>
              <Typography><strong>Số lượng:</strong> {selectedItem.quantity}</Typography>
              <Typography><strong>Ghi chú:</strong> {selectedItem.reason || '---'}</Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img src={selectedItem.image} alt="Ảnh" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </Box>
            </>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscountManager;
