//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import CheckIcon from '@mui/icons-material/Check';

//react
import { useState, useEffect } from 'react';

const StaffReserve = () => {
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

    const handleClear = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
            projectFirestore.collection('reserve').doc(id).delete();
        }
    }

    const handleCheck = (id) => {
        if (window.confirm('Are you sure you want to check?')) {
            projectFirestore.collection('reserve').doc(id).update("checked", true);
        }
    }

    useEffect(() => {
        projectFirestore.collection('reserve')
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
                            <TableCell className={classes.tableHeader} align="center">Ngày</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Giờ</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Ghi chú</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Số khách</TableCell>
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
                                <TableCell align="center">{doc.hours}</TableCell>
                                <TableCell align="center">{doc.description ? doc.description : 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{doc.number}</TableCell>
                                <TableCell align="center">
                                    <CheckIcon
                                        className={classes.clearIcon}
                                        onClick={() => handleCheck(doc.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <ClearIcon
                                        className={classes.clearIcon}
                                        onClick={() => handleClear(doc.id)}
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

export default StaffReserve