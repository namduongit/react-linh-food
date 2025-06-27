import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell,
  TableHead, TableRow, TableFooter, TablePagination, Button, Box, Grid, TextField,
  MenuItem, Typography, IconButton
} from '@mui/material';
import ExportTicketDialog from '../ExportDialog/ExportDialog';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';
import { doc, updateDoc, increment, getDocs, collection, query, where } from 'firebase/firestore';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const AdminInbound = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  const statusArray = ['Chưa xác nhận', 'Đã xác nhận', 'Đã nhận hàng', 'Hoàn đơn', 'Đã hoàn thành'];

  const [sortOrder, setSortOrder] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [inboundDetails, setInboundDetails] = useState([]);
  const [dataDetail, setDataDetail] = useState([]);

  const [openExport, setOpenExport] = useState(false);

  const handleShowDetail = async (inboundId) => {
    const snap = await projectFirestore
      .collection('detail')
      .where('inboundId', '==', inboundId)
      .get();

    const details = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setInboundDetails(details);
    setOpenDialog(true);
  };


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

    await projectFirestore.collection('inbound').doc(id).delete();
    toast({ title: 'Thành công', message: 'Đã xóa phiếu nhập.', type: 'success' });
  };


  const handleStatus = async (event, id) => {
    const confirm = await showNotification('Xác nhận thay đổi trạng thái ?');
    if (!confirm) return;
    await projectFirestore.collection('inbound').doc(id).update({
      status: event.target.value
    });
    if (event.target.value === 'Đã hoàn thành') {
      const detailSnapshot = await projectFirestore
        .collection('detail')
        .where('inboundId', '==', id)
        .get();

      const updatePromises = [];

      for (const docSnap of detailSnapshot.docs) {
        const detailData = docSnap.data();
        const menuRef = projectFirestore.collection('menu').doc(detailData.menuId);
        const menuSnap = await menuRef.get();
        const menuData = menuSnap.data();

        const currentPrice = menuData.price || 0;
        const profitPercentage = menuData.profitPercentage || 0;
        const importPrice = detailData.price;

        if (currentPrice < importPrice) {
          const confirm = await showNotification(
            `Món "${menuData.name}" có giá bán hiện tại (${currencyFormat(currentPrice)}) thấp hơn giá nhập (${currencyFormat(importPrice)}).\n\nBạn có muốn cập nhật lại giá bán không?`
          );
          if (confirm) {
            const newPrice = Math.ceil(importPrice * (1 + profitPercentage / 100));
            updatePromises.push(
              menuRef.update({
                price: newPrice,
                quantity: increment(detailData.quantity)
              })
            );
          } else {
            updatePromises.push(
              menuRef.update({
                quantity: increment(detailData.quantity)
              })
            );
          }
        } else {
          updatePromises.push(
            menuRef.update({
              quantity: increment(detailData.quantity)
            })
          );
        }
      }

      await Promise.all(updatePromises);
    }


    toast({
      title: 'Thông báo',
      message: 'Cập nhật trạng thái thành công',
      type: 'success',
      duration: 3000
    });
  };


  useEffect(() => {
    const unsubscribe = projectFirestore.collection('inbound')
      .onSnapshot((snap) => {
        const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDocs(documents);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let temp = [...docs];
    if (dateFilter) {
      temp = temp.filter(item => dayjs(typeof item.createdAt?.toDate === 'function' ? item.createdAt.toDate() : item.createdAt).format('YYYY-MM-DD') === dateFilter);
    }
    if (sortOrder === 'asc') {
      temp.sort((a, b) => a.total - b.total);
    } else if (sortOrder === 'desc') {
      temp.sort((a, b) => b.total - a.total);
    }
    setFilteredDocs(temp);
  }, [sortOrder, dateFilter, docs]);

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
                setDateFilter('');
                setSortOrder('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>


      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={() => navigate('/admin/add-inbound')} sx={{ mr: 1 }}>
          Thêm phiếu nhập
        </Button>
        <Button variant='contained' onClick={() => navigate('/admin/supplier')} sx={{ mr: 1 }}>Nhà cung cấp</Button>
        <Button variant='contained' onClick={() => setOpenExport(true)} sx={{ mr: 1 }}>Phiếu xuất/Hủy</Button>
        <Button variant='contained' onClick={() => navigate('/admin/exports')}>Quản lý xuất</Button>
      </Box>

      <TableContainer component={Paper} className={classes.container}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell align="center">Mã phiếu nhập</TableCell>
              <TableCell align="center">Ngày nhập</TableCell>
              <TableCell align="center">Tổng tiền</TableCell>
              <TableCell align="center">Người tạo</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
              <TableCell align="center">Chi tiết</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocs.length > 0 ? (
              filteredDocs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doc) => (
                  <TableRow key={doc.id} sx={{
                    backgroundColor: doc.status == 'Đã hoàn thành' ? '#e8f5e9' : 'white',
                  }}>
                    <TableCell align="center">{doc.id}</TableCell>
                    <TableCell align="center">
                      {dayjs(doc.date?.toDate?.() || doc.date).format('YYYY-MM-DD')}
                    </TableCell>
                    <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                    <TableCell align="center">{doc.name}</TableCell>
                    <TableCell align="center">
                      <TextField
                        select
                        size="small"
                        value={doc.status}
                        onChange={(event) => handleStatus(event, doc.id)}
                        sx={{ minWidth: 180 }}
                      >
                        {statusArray.map((status, index) => (
                          <MenuItem
                            key={index}
                            value={status}
                            disabled={doc.status === 'Đã hoàn thành'}
                          >
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell align="center">
                      {/* <IconButton color="primary" onClick={() => handleEdit(doc.id)}>
                        <EditIcon />
                      </IconButton> */}
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doc.id, doc.status)}
                        disabled={doc.status === 'Đã hoàn thành'}
                      >
                        <ClearIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleShowDetail(doc.id);
                          setDataDetail(doc);
                        }}
                      >
                        Chi tiết
                      </Button>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
        <DialogContent dividers>
          <Typography><strong>ID:</strong> {dataDetail.id}</Typography>
          <Typography><strong>Ngày:</strong> {dataDetail.date}</Typography>
          <Typography><strong>Nhân viên nhập:</strong> {dataDetail.name}</Typography>
          <Typography><strong>Tổng:</strong> {currencyFormat(dataDetail.total)} đ</Typography>
          <Typography sx={{ mt: 2 }}><strong>Chi tiết hàng nhập:</strong></Typography>

          {inboundDetails.length > 0 ? (
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Tên món</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Giá nhập</TableCell>
                  <TableCell>Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inboundDetails.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.menuName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{currencyFormat(item.price)}</TableCell>
                    <TableCell>{currencyFormat(item.quantity * item.price)}</TableCell>
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

      <ExportTicketDialog open={openExport} onClose={() => setOpenExport(false)} />
    </Container>
  );
};

export default AdminInbound;
