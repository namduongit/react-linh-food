//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, ButtonGroup, Button, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

import {
    Dialog, DialogTitle, DialogContent,
    DialogActions

} from '@mui/material';

//react
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

import { useNavigate } from 'react-router-dom';
import { useLocation, Link } from 'react-router-dom';

const DineIn = () => {
    const classes = useStyles();
    const statusArray = ["Chưa xác nhận", "Đã xác nhận", "Nhà hàng đang chuẩn bị món", "Đã hoàn thành"]
    const [page, setPage] = useState(0);
    const [docs, setDocs] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const location = useLocation();

    const [openDineInDialog, setOpenDineInDialog] = useState(false);
    const [selectedDineInOrder, setSelectedDineInOrder] = useState(null);

    const handleOpenDineInDialog = (order) => {
        setSelectedDineInOrder(order);
        setOpenDineInDialog(true);
    };
    const handleCloseDineInDialog = () => setOpenDineInDialog(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id, seatID) => {
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa hóa đơn này ?');
        if (!confirm) return;
        projectFirestore.collection('dinein').doc(id).delete();
        projectFirestore.collection('seat').doc(seatID).update({
            total: 0,
            available: true,
        });
        toast({
            title: 'Thông báo',
            message: `Xóa thành công hóa đơn ${id}`,
            type: 'success',
            duration: 3000
        })
    }

    const handleStatus = async (event, id, seatID) => {
        projectFirestore.collection('dinein').doc(id).update("status", event.target.value);
        if (event.target.value === 'Đã hoàn thành') {
            const confirm = await showNotification('Chắc chắn hoàn tất đơn hàng?');
            if (confirm) {
                projectFirestore.collection('dinein').doc(id).update("checked", true)
                projectFirestore.collection('seat').doc(seatID).update({
                    total: 0,
                    available: true,
                })
                toast({
                    title: 'Thông báo',
                    message: `Hoàn tất đơn hàng ${id} thành công`,
                    type: 'success',
                    duration: 3000
                })

            } else {
                projectFirestore.collection('dinein').doc(id).update({
                    checked: false,
                    status: 'Nhà hàng đang chuẩn bị món'
                })
            }
        } else {
            projectFirestore.collection('dinein').doc(id).update({
                checked: false,
                status: event.target.value
            });
            projectFirestore.collection('seat').doc(seatID).update({
                available: false,
            })
        }
    }

    useEffect(() => {
        projectFirestore.collection('dinein')
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

            <ButtonGroup sx={{ my: 2 }}>
                <Button
                    component={Link}
                    to="/dinein"
                    variant={
                        location.pathname === '/dinein' ||
                            location.pathname === '/admin/dinein' ||
                            location.pathname === '/staff/dinein'
                            ? 'contained'
                            : 'outlined'
                    }
                >
                    Đơn hàng tại chỗ
                </Button>
                <Button
                    component={Link}
                    to="/order"
                    variant={
                        location.pathname === '/order' ||
                            location.pathname === '/admin/order' ||
                            location.pathname === '/staff/order'
                            ? 'contained'
                            : 'outlined'
                    }
                >
                    Đơn hàng vận chuyển
                </Button>
            </ButtonGroup>

            <TableContainer component={Paper} elevation={3}>
                <MuiTable sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            {[
                                'Số bàn',
                                'Thời gian',
                                'Ghi chú',
                                'Tổng tiền',
                                'Trạng thái',
                                'Thông tin',
                                'Xóa',
                            ].map((header, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow
                                key={doc.id}
                                sx={{
                                    backgroundColor: doc.checked ? '#e8f5e9' : 'white',
                                    '&:hover': { backgroundColor: '#f9f9f9' },
                                }}
                            >
                                <TableCell align="center">{doc.seat}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">
                                    {doc.note || 'Không có ghi chú'}
                                </TableCell>
                                <TableCell align="center">
                                    {currencyFormat(doc.total)}
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        select
                                        size="small"
                                        value={doc.status}
                                        onChange={(event) =>
                                            handleStatus(event, doc.id, doc.seatID)
                                        }
                                        sx={{ minWidth: 180 }}
                                    >
                                        {statusArray.map((status, idx) => (
                                            <MenuItem
                                                key={idx}
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
                                        onClick={() => handleOpenDineInDialog(doc)}
                                    >
                                        Chi tiết
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <ClearIcon
                                        sx={{
                                            color:
                                                doc.status === 'Đã hoàn thành' ? '#ccc' : '#f44336',
                                            cursor:
                                                doc.status === 'Đã hoàn thành'
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                            transition: '0.2s',
                                            '&:hover': {
                                                transform:
                                                    doc.status === 'Đã hoàn thành' ? 'none' : 'scale(1.2)',
                                            },
                                        }}
                                        onClick={
                                            doc.status === 'Đã hoàn thành'
                                                ? undefined
                                                : () => handleClear(doc.id, doc.seatID)
                                        }
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

            <Dialog open={openDineInDialog} onClose={handleCloseDineInDialog} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết hóa đơn tại chỗ</DialogTitle>
                <DialogContent dividers>
                    {selectedDineInOrder ? (
                        <>
                            <Typography><strong>ID:</strong> {selectedDineInOrder.id}</Typography>
                            <Typography><strong>Ngày:</strong> {selectedDineInOrder.date}</Typography>
                            <Typography><strong>Tổng:</strong> {currencyFormat(selectedDineInOrder.total)} đ</Typography>
                            <Typography sx={{ mt: 2 }}><strong>Chi tiết món:</strong></Typography>
                            <ul style={{ paddingLeft: 16 }}>
                                {selectedDineInOrder.cart?.map((item, i) => (
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
                    <Button onClick={handleCloseDineInDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default DineIn