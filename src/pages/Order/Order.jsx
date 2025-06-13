import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { projectFirestore, projectAuth } from '../../firebase/config';
import { Container, Table as MuiTable, TableContainer, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { currencyFormat } from '../../utils/currencyFormat'
import { useAuthState } from "react-firebase-hooks/auth";

const Order = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [user] = useAuthState(projectAuth);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
        console.log(order)
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        if (user) {
            projectFirestore.collection('order')
                .where('userID', '==', user.uid)
                .where('status', '!=', 'Đã hoàn thành')
                .orderBy('status', 'asc')
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
        }

    }, [setDocs, user])
    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Theo dõi đơn hàng
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                Xem thông tin đơn hàng bạn đã đặt và theo dõi tình trạng giao hàng
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                <MuiTable sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell align="center"><strong>Tên</strong></TableCell>
                            <TableCell align="center"><strong>SĐT</strong></TableCell>
                            <TableCell align="center"><strong>Địa chỉ</strong></TableCell>
                            <TableCell align="center"><strong>Ghi chú</strong></TableCell>
                            <TableCell align="center"><strong>Tổng tiền</strong></TableCell>
                            <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                            <TableCell align="center"><strong>Chi tiết</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {docs.length > 0 ? (
                            (rowsPerPage > 0
                                ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : docs
                            ).map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell align="center">{doc.name}</TableCell>
                                    <TableCell align="center">{doc.phone}</TableCell>
                                    <TableCell align="center">
                                        {doc.address}/{doc.ward}/{doc.district}/{doc.province}
                                    </TableCell>
                                    <TableCell align="center">
                                        {doc.note || 'Không có ghi chú'}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'green' }}>
                                        {currencyFormat(doc.total)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            sx={{
                                                color:
                                                    doc.status === 'Chờ xác nhận'
                                                        ? 'orange'
                                                        : doc.status === 'Đang giao'
                                                            ? 'blue'
                                                            : doc.status === 'Đã hoàn thành'
                                                                ? 'green'
                                                                : 'gray',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {doc.status}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => handleOpenDialog(doc)}>
                                            Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography>Không có đơn hàng nào</Typography>
                                </TableCell>
                            </TableRow>
                        )}
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
                <DialogTitle fontWeight="bold">Chi tiết đơn hàng</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedOrder ? (
                        <>
                            <Typography><strong>ID đơn hàng:</strong> {selectedOrder.id}</Typography>
                            <Typography><strong>Ngày đặt:</strong> {selectedOrder.date}</Typography>
                            <Typography><strong>Trạng thái:</strong> {selectedOrder.status}</Typography>
                            <Typography><strong>Tổng tiền:</strong> {currencyFormat(selectedOrder.total)} đ</Typography>

                            <Typography><strong>Món đã đặt:</strong></Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                {selectedOrder.cart.map((item, index) => (
                                    <li key={index}>
                                        {item.name} - {item.quantity} x {currencyFormat(item.price)} đ
                                    </li>
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained" color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default Order