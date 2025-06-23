import ClearIcon from '@mui/icons-material/Clear';

import {
    Container, Button, Table as MuiTable, TableContainer, TextField, MenuItem,
    Paper, TableBody, TableCell, TableHead, TableRow, TableFooter,
    TablePagination, Typography, Box, ButtonGroup
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useState, useEffect } from 'react';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import dayjs from 'dayjs';

const StaffOrder = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();

    const statusArray = [
        "Chưa xác nhận", "Đã xác nhận", "Đã hủy",
        "Nhà hàng đang chuẩn bị món", "Đang giao hàng",
        "Đã giao hàng", "Đã hoàn thành"
    ];

    const [docs, setDocs] = useState([]);
    const [filteredDocs, setFilteredDocs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa ?');
        if (!confirm) return;
        projectFirestore.collection('order').doc(id).delete();
        toast({ title: 'Thông báo', message: `Xóa thành hóa đơn ${id}`, type: 'success', duration: 3000 });
    };

    const handleStatus = async (event, id) => {
        const newStatus = event.target.value;
        const confirm = await showNotification('Thay đổi trạng thái đơn hàng ?');
        if (!confirm) return;

        const order = docs.find((doc) => doc.id === id);
        if (!order) return;

        if (newStatus === 'Đã hoàn thành') {
            const batch = projectFirestore.batch();
            let canUpdate = true;
            const insufficientItems = [];

            for (const item of order.cart) {
                const refType = item.isDiscount ? 'discounts' : 'menu';
                console.log(refType)


                const itemRef = projectFirestore.collection(refType).doc(item.menuId);
                const snap = await itemRef.get();

                if (!snap.exists) continue;

                const data = snap.data();
                const currentQuantity = data.quantity || 0;

                console.log(`Số lượng còn lại trong kho`)
                if (currentQuantity < item.quantity) {
                    canUpdate = false;
                    insufficientItems.push(data.name || data.subtitle || 'Không rõ tên');
                    continue;
                }
                batch.update(itemRef, { quantity: currentQuantity - item.quantity });
            }

            if (!canUpdate) {
                toast({
                    title: 'Thông báo',
                    message: `Không đủ hàng cho các món: ${insufficientItems.join(', ')}`,
                    type: 'warning',
                    duration: 3000
                });
                return;
            }
            return;
            await batch.commit();
        }
        return;
        await projectFirestore.collection('order').doc(id).update({
            checked: newStatus === 'Đã hoàn thành' || newStatus === 'Đã hủy',
            status: newStatus
        });

        toast({
            title: 'Thông báo',
            message: 'Cập nhật trạng thái đơn hàng thành công',
            type: 'success'
        });
    };


    useEffect(() => {
        const unsub = projectFirestore.collection('order')
            .orderBy('checked', 'asc')
            .orderBy('date', 'desc')
            .onSnapshot((snap) => {
                const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setDocs(data);
            });
        return () => unsub();
    }, []);

    useEffect(() => {
        let temp = [...docs];
        if (fromDate && toDate) {
            temp = temp.filter(doc => {
                const date = dayjs(doc.date);
                return date.isAfter(dayjs(fromDate).subtract(1, 'day')) && date.isBefore(dayjs(toDate).add(1, 'day'));
            });
        }
        if (statusFilter) temp = temp.filter(doc => doc.status === statusFilter);
        if (sortOrder === 'asc') temp.sort((a, b) => a.total - b.total);
        if (sortOrder === 'desc') temp.sort((a, b) => b.total - a.total);
        setFilteredDocs(temp);
    }, [docs, fromDate, toDate, statusFilter, sortOrder]);

    return (
        <Container sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Quản lý đơn hàng</Typography>

            <ButtonGroup sx={{ mb: 2 }}>
                <Button component={Link} to="/dinein" variant={location.pathname.includes('dinein') ? 'contained' : 'outlined'}>Đơn hàng tại chỗ</Button>
                <Button component={Link} to="/order" variant={location.pathname.includes('order') ? 'contained' : 'outlined'}>Đơn hàng vận chuyển</Button>
            </ButtonGroup>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <TextField label="Từ ngày" type="date" InputLabelProps={{ shrink: true }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    <TextField label="Đến ngày" type="date" InputLabelProps={{ shrink: true }} value={toDate} onChange={e => setToDate(e.target.value)} />
                    <TextField select label="Trạng thái" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 200 }}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {statusArray.map((status, i) => <MenuItem key={i} value={status}>{status}</MenuItem>)}
                    </TextField>
                    <TextField select label="Sắp xếp theo tiền" value={sortOrder} onChange={e => setSortOrder(e.target.value)} sx={{ width: '200px' }}>
                        <MenuItem value="">Mặc định</MenuItem>
                        <MenuItem value="asc">Tăng dần</MenuItem>
                        <MenuItem value="desc">Giảm dần</MenuItem>
                    </TextField>
                    <Button variant="outlined" color="secondary" onClick={() => { setFromDate(''); setToDate(''); setStatusFilter(''); setSortOrder(''); }}>Xóa bộ lọc</Button>
                </Box>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <MuiTable>
                    <TableHead>
                        <TableRow>
                            {["Tên", "Số ĐT", "Thời gian", "Địa chỉ", "Ghi chú", "Tổng tiền", "Trạng thái", "Chi tiết", "Xóa"].map((title, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>{title}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 ? filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredDocs).map(doc => (
                            <TableRow key={doc.id} sx={{ backgroundColor: doc.checked ? '#e8f5e9' : 'white' }}>
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.phone}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">{doc.address}/{doc.ward}/{doc.district}/{doc.province}</TableCell>
                                <TableCell align="center">{doc.note || 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                                <TableCell align="center">
                                    <TextField select size="small" value={doc.status} onChange={(e) => handleStatus(e, doc.id)} sx={{ minWidth: 180 }}>
                                        {statusArray.map((status, index) => (
                                            <MenuItem key={index} value={status} disabled={doc.status === 'Đã hoàn thành' || doc.status === 'Đã hủy'}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" onClick={() => handleOpenDialog(doc)}>Chi tiết</Button>
                                </TableCell>
                                <TableCell align="center">
                                    <ClearIcon
                                        sx={{ color: doc.status === 'Đã hoàn thành' ? '#ccc' : '#f44336', cursor: doc.status === 'Đã hoàn thành' ? 'not-allowed' : 'pointer', '&:hover': { transform: doc.status === 'Đã hoàn thành' ? 'none' : 'scale(1.2)' } }}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleClear(doc.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15, filteredDocs.length]}
                                count={filteredDocs.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            />
                        </TableRow>
                    </TableFooter>
                </MuiTable>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết hóa đơn vận chuyển</DialogTitle>
                <DialogContent dividers>
                    {selectedOrder ? (
                        <>
                            <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
                            <Typography><strong>Ngày:</strong> {selectedOrder.date}</Typography>
                            <Typography><strong>Tổng:</strong> {currencyFormat(selectedOrder.total)} đ</Typography>
                            <Typography sx={{ mt: 2 }}><strong>Chi tiết món:</strong></Typography>
                            <ul style={{ paddingLeft: 16 }}>
                                {selectedOrder.cart?.map((item, i) => (
                                    <li key={i}>{(item.name || item.subtitle || 'Món không rõ')} - {item.quantity} x {currencyFormat(item.price)} đ</li>
                                ))}
                            </ul>
                        </>
                    ) : <Typography>Không có dữ liệu</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StaffOrder;