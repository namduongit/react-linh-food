import ClearIcon from '@mui/icons-material/Clear';
import { Container, ButtonGroup, Button, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { updateDoc, doc } from 'firebase/firestore';
import dayjs from 'dayjs';

const DineInOrdersFiltered = () => {
    const statusArray = ["Chưa xác nhận", "Đã xác nhận", "Nhà hàng đang chuẩn bị món", "Đã hoàn thành"];
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [docs, setDocs] = useState([]);
    const [filteredDocs, setFilteredDocs] = useState([]);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsub = projectFirestore.collection('dinein')
            .orderBy('checked', 'asc')
            .orderBy('date', 'desc')
            .onSnapshot((snap) => {
                const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setDocs(documents);
            });
        return () => unsub();
    }, []);

    useEffect(() => {
        let temp = [...docs];
        if (fromDate) temp = temp.filter(d => dayjs(d.date).isAfter(dayjs(fromDate).subtract(1, 'day')));
        if (toDate) temp = temp.filter(d => dayjs(d.date).isBefore(dayjs(toDate).add(1, 'day')));
        if (statusFilter) temp = temp.filter(d => d.status === statusFilter);
        if (sortOrder === 'asc') temp.sort((a, b) => a.total - b.total);
        if (sortOrder === 'desc') temp.sort((a, b) => b.total - a.total);
        setFilteredDocs(temp);
    }, [docs, fromDate, toDate, statusFilter, sortOrder]);

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        setStatusFilter('');
        setSortOrder('');
    };

    const handleStatusChange = async (event, id, seatID) => {
        const newStatus = event.target.value;
        const confirm = await showNotification('Thay đổi trạng thái đơn hàng ?');
        if (!confirm) return;

        const order = docs.find(doc => doc.id === id);
        if (!order) return;

        if (newStatus === 'Đã hoàn thành') {
            const batch = projectFirestore.batch();
            let canUpdate = true;
            const insufficientItems = [];

            for (const item of order.cart) {
                const menuRef = projectFirestore.collection(item.isDiscount ? 'discounts' : 'menu').doc(item.menuId);
                const snap = await menuRef.get();
                if (!snap.exists) continue;

                const data = snap.data();
                const currentQuantity = data.quantity || 0;

                if (currentQuantity < item.quantity) {
                    canUpdate = false;
                    insufficientItems.push(data.name || data.subtitle || 'Không rõ tên');
                    continue;
                }
                batch.update(menuRef, { quantity: currentQuantity - item.quantity });
            }
            if (!canUpdate) {
                toast({
                    title: 'Thông báo',
                    message: `Không đủ hàng cho các món: ${insufficientItems.join(', ')}`,
                    type: 'warning'
                });
                return;
            }

            await batch.commit();
            await updateDoc(doc(projectFirestore, 'seat', seatID), {
                total: 0,
                status: 'Trống'
            });
        }

        await projectFirestore.collection('dinein').doc(id).update({
            checked: newStatus === 'Đã hoàn thành',
            status: newStatus
        });

        toast({
            title: 'Thành công',
            message: 'Cập nhật trạng thái đơn hàng',
            type: 'success'
        });
    };


    const handleDelete = async (id, seatID, status) => {
        if (status === 'Đã hoàn thành') return;
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa hóa đơn này ?');
        if (!confirm) return;
        await projectFirestore.collection('dinein').doc(id).delete();
        await updateDoc(doc(projectFirestore, 'seat', seatID), { total: 0, available: true });
        toast({ title: 'Xóa thành công', message: `Hóa đơn ${id} đã được xóa`, type: 'success' });
    };

    return (
        <Container sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Quản lý đơn hàng tại chỗ</Typography>

            <ButtonGroup sx={{ mb: 2 }}>
                <Button component={Link} to="/dinein" variant={location.pathname.includes('dinein') ? 'contained' : 'outlined'}>Đơn hàng tại chỗ</Button>
                <Button component={Link} to="/order" variant={location.pathname.includes('order') ? 'contained' : 'outlined'}>Đơn hàng vận chuyển</Button>
            </ButtonGroup>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField label="Từ ngày" type="date" value={fromDate} InputLabelProps={{ shrink: true }} onChange={e => setFromDate(e.target.value)} />
                    <TextField label="Đến ngày" type="date" value={toDate} InputLabelProps={{ shrink: true }} onChange={e => setToDate(e.target.value)} />
                    <TextField label="Trạng thái" select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ width: '200px' }}>
                        <MenuItem value=''>Tất cả</MenuItem>
                        {statusArray.map((status, i) => <MenuItem key={i} value={status}>{status}</MenuItem>)}
                    </TextField>
                    <TextField label="Sắp xếp theo tổng tiền" select value={sortOrder} onChange={e => setSortOrder(e.target.value)} sx={{ width: '200px' }}>
                        <MenuItem value=''>Mặc định</MenuItem>
                        <MenuItem value='asc'>Tăng dần</MenuItem>
                        <MenuItem value='desc'>Giảm dần</MenuItem>
                    </TextField>
                    <Button variant="outlined" color="secondary" onClick={handleClearFilters}>Xóa bộ lọc</Button>
                </Box>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <MuiTable>
                    <TableHead>
                        <TableRow>
                            {['Số bàn', 'Thời gian', 'Ghi chú', 'Tổng tiền', 'Trạng thái', 'Chi tiết', 'Xóa'].map((head, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>{head}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(doc => (
                            <TableRow key={doc.id} sx={{ backgroundColor: doc.checked ? '#e8f5e9' : 'white' }}>
                                <TableCell align="center">{doc.seat}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">{doc.note || 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                                <TableCell align="center">
                                    <TextField select size="small" value={doc.status} onChange={e => handleStatusChange(e, doc.id, doc.seatID)}>
                                        {statusArray.map((status, i) => (
                                            <MenuItem key={i} value={status} disabled={doc.status === 'Đã hoàn thành'}>{status}</MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" onClick={() => { setSelectedOrder(doc); setOpenDialog(true); }}>Chi tiết</Button>
                                </TableCell>
                                <TableCell align="center">
                                    <ClearIcon
                                        sx={{ color: doc.status === 'Đã hoàn thành' ? '#ccc' : '#f44336', cursor: doc.status === 'Đã hoàn thành' ? 'not-allowed' : 'pointer' }}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleDelete(doc.id, doc.seatID, doc.status)}
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
                                onPageChange={(_, newPage) => setPage(newPage)}
                                onRowsPerPageChange={e => setRowsPerPage(parseInt(e.target.value, 10))}
                            />
                        </TableRow>
                    </TableFooter>
                </MuiTable>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết hóa đơn tại chỗ</DialogTitle>
                <DialogContent dividers>
                    {selectedOrder ? (
                        <>
                            <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
                            <Typography><strong>Ngày:</strong> {selectedOrder.date}</Typography>
                            <Typography><strong>Tổng:</strong> {currencyFormat(selectedOrder.total)} đ</Typography>
                            <Typography sx={{ mt: 2 }}><strong>Chi tiết món:</strong></Typography>
                            <ul style={{ paddingLeft: 16 }}>
                                {selectedOrder.cart?.map((item, i) => (
                                    <li key={i}>{item.name || item.subtitle || 'Món không rõ'} - {item.quantity} x {currencyFormat(item.price)} đ</li>
                                ))}
                            </ul>
                        </>
                    ) : <Typography>Không có dữ liệu</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DineInOrdersFiltered;
