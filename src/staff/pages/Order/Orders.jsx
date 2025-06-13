//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, Button, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box, ButtonGroup } from '@mui/material';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions

} from '@mui/material';

import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

//react
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

import { useNavigate } from 'react-router-dom';
import { useLocation, Link } from 'react-router-dom';

const StaffOrder = () => {
    const classes = useStyles();
    const statusArray = ["Chưa xác nhận", "Đã xác nhận", "Nhà hàng đang chuẩn bị món", "Đang giao hàng", "Đã giao hàng", "Đã hoàn thành"]
    const [page, setPage] = useState(0);
    const [docs, setDocs] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const location = useLocation();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa ?');
        if (!confirm) return;
        projectFirestore.collection('order').doc(id).delete();
        toast({
            title: 'Thông báo',
            message: `Xóa thành hóa đơn ${id}`,
            type: 'success',
            duration: 3000
        })
    }

    const handleStatus = (event, id) => {
        projectFirestore.collection('order').doc(id).update("status", event.target.value);
        if (event.target.value === 'Đã hoàn thành') {
            if (window.confirm('Hoàn tất đơn hàng?')) {
                projectFirestore.collection('order').doc(id).update("checked", true)
            } else {
                projectFirestore.collection('order').doc(id).update({
                    checked: false,
                    status: 'Nhà hàng đang chuẩn bị món'
                })
            }
        } else {
            projectFirestore.collection('order').doc(id).update({
                checked: false,
                status: event.target.value
            });
        }
    }

    useEffect(() => {
        projectFirestore.collection('order')
            .orderBy('checked', 'asc')
            .orderBy('date', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setDocs(documents)
            })
    }, [setDocs])

    return (
        <Container sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý đơn hàng
            </Typography>

            <ButtonGroup sx={{ mb: 2 }}>
                <Button
                    component={Link}
                    to="/dinein"
                    variant={location.pathname.includes('dinein') ? 'contained' : 'outlined'}
                >
                    Đơn hàng tại chỗ
                </Button>
                <Button
                    component={Link}
                    to="/order"
                    variant={location.pathname.includes('order') ? 'contained' : 'outlined'}
                >
                    Đơn hàng vận chuyển
                </Button>
            </ButtonGroup>

            <TableContainer component={Paper} elevation={3}>
                <MuiTable sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            {["Tên", "Số ĐT", "Thời gian", "Địa chỉ", "Ghi chú", "Tổng tiền", "Trạng thái", "Chi tiết", "Xóa"].map((title, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>
                                    {title}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : docs).map((doc) => (
                            <TableRow
                                key={doc.id}
                                sx={{
                                    backgroundColor: doc.checked ? '#e8f5e9' : 'white',
                                    '&:hover': { backgroundColor: '#f9f9f9' }
                                }}
                            >
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.phone}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">
                                    {doc.address}/{doc.ward}/{doc.district}/{doc.province}
                                </TableCell>
                                <TableCell align="center">{doc.note || 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
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
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenDialog(doc)}
                                    >
                                        Chi tiết
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <ClearIcon
                                        sx={{
                                            color: doc.status === 'Đã hoàn thành' ? '#ccc' : '#f44336',
                                            cursor: doc.status === 'Đã hoàn thành' ? 'not-allowed' : 'pointer',
                                            transition: '0.2s',
                                            '&:hover': {
                                                transform: doc.status === 'Đã hoàn thành' ? 'none' : 'scale(1.2)'
                                            }
                                        }}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleClear(doc.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15, docs.length]}
                                count={docs.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </MuiTable>
            </TableContainer>

            {/* Dialog chi tiết đơn hàng */}
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
                                    <li key={i}>
                                        {(item.name || item.subtitle || 'Món không rõ')} - {item.quantity} x {currencyFormat(item.price)} đ
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default StaffOrder