//material-ui
import { Typography, Table, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Container } from '@mui/material';
import { useStyles } from './styles';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


//react
import { useState, useEffect } from 'react';

//firebase
import { projectFirestore } from '../../../firebase/config';

import { currencyFormat } from '../../../utils/currencyFormat';

const AdminTotal = () => {
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orders, setOrders] = useState([]);
    const [dineIn, setDineIn] = useState([]);
    const [bigTotalOrder, setBigTotalOrder] = useState(0);
    const [bigTotalDineIn, setBigTotalDineIn] = useState(0);
    const [bigTotal, setBigTotal] = useState(0);

    // Chi tiết
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

    // Chi tiết tại chỗ
    const [openDineInDialog, setOpenDineInDialog] = useState(false);
    const [selectedDineInOrder, setSelectedDineInOrder] = useState(null);

    const handleOpenDineInDialog = (order) => {
        setSelectedDineInOrder(order);
        setOpenDineInDialog(true);
    };

    const handleCloseDineInDialog = () => {
        setSelectedDineInOrder(null);
        setOpenDineInDialog(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        projectFirestore.collection('order')
            .where('checked', '==', true)
            .orderBy('date', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setOrders(documents);
                if (documents.length > 0) {
                    setBigTotalOrder(documents.reduce((n, { total }) => n + (parseInt(total)), 0))
                }
            })

        projectFirestore.collection('dinein')
            .where('checked', '==', true)
            .orderBy('date', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setDineIn(documents);
                if (documents.length > 0) {
                    setBigTotalDineIn(documents.reduce((n, { total }) => n + (parseInt(total)), 0))
                }
            })
    }, [setBigTotalOrder, setBigTotalDineIn])


    useEffect(() => {
        setBigTotal(() => bigTotalOrder + bigTotalDineIn)
    }, [bigTotalOrder, bigTotalDineIn])

    return (
        <Container className={classes.container}>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Typography style={{ marginTop: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                    Tổng doanh thu đơn vận chuyển: {currencyFormat(bigTotalOrder)} đ
                </Typography>
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID </TableCell>
                            <TableCell className={classes.tableHeader} align="center">Date</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Total</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders && (rowsPerPage > 0
                            ? orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : orders
                        ).map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell align="center">{doc.id}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)} đ</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" onClick={() => handleOpenDialog(doc)}>
                                        Chi tiết
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={orders.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Typography style={{ marginTop: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                    Tổng doanh thu đơn mang về: {currencyFormat(bigTotalDineIn)} đ
                </Typography>
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID </TableCell>
                            <TableCell className={classes.tableHeader} align="center">Date</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Total</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dineIn && (rowsPerPage > 0
                            ? dineIn.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : dineIn
                        ).map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell align="center">{doc.id}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)} đ</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" onClick={() => handleOpenDineInDialog(doc)}>
                                        Chi tiết
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={dineIn.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            <Typography style={{ marginTop: '10px', marginBottom: '30px' }} variant='h5'>
                Tổng doanh thu: {currencyFormat(bigTotal)} đ
            </Typography>

            {/* Phần Dialog hóa đơn vận chuyển */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết hóa đơn vận chuyển</DialogTitle>
                <DialogContent dividers>
                    {selectedOrder ? (
                        <div>
                            <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
                            <Typography><strong>Ngày:</strong> {selectedOrder.date}</Typography>
                            <Typography><strong>Tổng tiền:</strong> {currencyFormat(selectedOrder.total)} đ</Typography>

                            {selectedOrder.cart && (
                                <>
                                    <Typography><strong>Món đã đặt:</strong></Typography>
                                    <ul>
                                        {selectedOrder.cart.map((item, index) => (
                                            <li key={index}>
                                                {item.name} - {item.quantity} x {currencyFormat(item.price)} đ
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Phần Dialog hóa đơn tại chỗ */}
            <Dialog open={openDineInDialog} onClose={handleCloseDineInDialog} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết hóa đơn tại chỗ</DialogTitle>
                <DialogContent dividers>
                    {selectedDineInOrder ? (
                        <div>
                            <Typography><strong>ID:</strong> {selectedDineInOrder.id}</Typography>
                            <Typography><strong>Ngày:</strong> {selectedDineInOrder.date}</Typography>
                            <Typography><strong>Tổng tiền:</strong> {currencyFormat(selectedDineInOrder.total)} đ</Typography>

                            {selectedDineInOrder.cart && (
                                <>
                                    <Typography><strong>Món đã đặt:</strong></Typography>
                                    <ul>
                                        {selectedDineInOrder.cart.map((item, index) => (
                                            <li key={index}>
                                                {item.name || item.subtitle || 'Món không rõ'} - {item.quantity} x {currencyFormat(item.price)} đ
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDineInDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>

        </Container>
    )
}

export default AdminTotal