import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { projectFirestore, projectAuth } from '../../firebase/config';
import { Container, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { currencyFormat } from '../../utils/currencyFormat'
import { useAuthState } from "react-firebase-hooks/auth";

const Order = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [user] = useAuthState(projectAuth);

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
        <Container >
            <TableContainer component={Paper} className={classes.container}>
                <MuiTable sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">Tên</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Số điện thoại</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Chi tiết đơn hàng</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Địa chỉ</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Ghi chú</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Tổng tiền</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Tình trạng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs && (rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow key={doc.id} >
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.phone}</TableCell>

                                <TableCell>
                                    {doc.cart.map(cart => (
                                        <Box key={cart.id}>
                                            <Typography style={{ fontWeight: 'bold' }}>{cart.name}</Typography>
                                            <Typography>Số lượng: {cart.quantity}</Typography>
                                        </Box>
                                    ))}
                                </TableCell>
                                <TableCell align="center">{doc.address}/{doc.ward}/{doc.district}/{doc.province}</TableCell>
                                <TableCell align="center">{doc.note ? doc.note : 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                                <TableCell align="center">{doc.status}</TableCell>
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
        </Container>
    )
}

export default Order