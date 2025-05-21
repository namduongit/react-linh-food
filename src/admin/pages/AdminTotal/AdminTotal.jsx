//material-ui
import { Typography, Table, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Container } from '@mui/material';
import { useStyles } from './styles';

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
                <Typography style={{ marginTop: '30px' }}>
                    Tổng doanh thu đơn vận chuyển: {currencyFormat(bigTotalOrder)} đ
                </Typography>
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID </TableCell>
                            <TableCell className={classes.tableHeader} align="center">Date</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Total</TableCell>
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
                <Typography style={{ marginTop: '30px' }}>
                    Tổng doanh thu đơn mang về: {currencyFormat(bigTotalDineIn)} đ
                </Typography>
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID </TableCell>
                            <TableCell className={classes.tableHeader} align="center">Date</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Total</TableCell>
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
            <Typography style={{ marginTop: '30px' }} variant='h4'>
                Tổng doanh thu: {currencyFormat(bigTotal)} đ
            </Typography>
        </Container>
    )
}

export default AdminTotal