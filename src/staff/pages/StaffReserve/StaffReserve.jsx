//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import CheckIcon from '@mui/icons-material/Check';

//react
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

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

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa ?');
        if (!confirm) return;
        projectFirestore.collection('reserve').doc(id).delete();
        toast({
            title: 'Thông báo',
            message: `Xóa thành hóa đơn ${id}`,
            type: 'success',
            duration: 3000
        })
    }

    const handleCheck = async (id) => {
        const confirm = await showNotification('Bạn có muốn xác nhận ?');
        if (confirm) {
            projectFirestore.collection('reserve').doc(id).update("checked", true);
        }
        toast({
            title: 'Thông báo',
            message: `Xác nhận thành công đơn ${id}`,
            type: 'success',
            duration: 3000
        })
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
                                        disabled={doc.status == 'Đã hoàn thành'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <ClearIcon
                                        className={classes.clearIcon}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleClear(doc.id)}
                                        style={{ color: doc.status === 'Đã hoàn thành' ? 'black' : undefined, cursor: doc.status === 'Đã hoàn thành' ? 'not-allowed' : 'pointer' }}
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