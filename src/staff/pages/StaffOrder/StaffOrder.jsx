//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

//react
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

const StaffOrder = () => {
    const classes = useStyles();
    const statusArray = ["Chưa xác nhận", "Đã xác nhận", "Nhà hàng đang chuẩn bị món", "Đang giao hàng", "Đã giao hàng", "Đã hoàn thành"]
    const [page, setPage] = useState(0);
    const [docs, setDocs] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
        <Container>
            <TableContainer component={Paper} className={classes.container}>
                <MuiTable sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">Tên</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Số điện thoại</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Thời gian</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Chi tiết đơn hàng</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Địa chỉ</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Ghi chú</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Tổng tiền</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Trạng thái</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Xóa</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs && (rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow
                                key={doc.id}
                                className={doc.checked ? classes.rowDone : null}
                            >
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.phone}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
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
                                <TableCell align="center">
                                    <TextField
                                        select
                                        value={doc.status}
                                        onChange={(event) => handleStatus(event, doc.id)}
                                    >
                                        {statusArray.map((role, index) => (
                                            <MenuItem
                                                key={index}
                                                value={role}
                                                disabled={doc.status == 'Đã hoàn thành'}
                                            >
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <ClearIcon
                                        className={classes.clearIcon}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined :() => handleClear(doc.id)}
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
        </Container>
    )
}

export default StaffOrder