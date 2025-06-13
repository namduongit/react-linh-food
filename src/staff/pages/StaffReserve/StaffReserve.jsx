import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import {
    Container, Table as MuiTable, TableContainer, Paper,
    TableBody, TableCell, TableHead, TableRow,
    TableFooter, TablePagination, Typography
} from '@mui/material';
import { projectFirestore } from '../../../firebase/config';

import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

const StaffReserve = () => {
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
        await projectFirestore.collection('reserve').doc(id).delete();
        toast({
            title: 'Thông báo',
            message: `Xóa thành công hóa đơn ${id}`,
            type: 'success',
            duration: 3000
        })
    }

    const handleCheck = async (id) => {
        const confirm = await showNotification('Bạn có muốn xác nhận ?');
        if (!confirm) return;
        await projectFirestore.collection('reserve').doc(id).update({ checked: true });
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
                setDocs(documents);
            })
    }, []);

    useEffect(() => {
        const today = new Date();
        docs.forEach(doc => {
            const lateDate = new Date(doc.date);
            if (today > lateDate && !doc.checked) {
                projectFirestore.collection('reserve').doc(doc.id).delete();
            }
        });
    }, [docs]);

    return (
        <Container sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý lịch đặt bàn
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Những lịch cũ sẽ được tự động hủy bỏ dù chưa xác nhận
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <MuiTable sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            {["Tên", "Số điện thoại", "Ngày", "Giờ", "Ghi chú", "Số khách", "Xác nhận", "Xóa"].map((title, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>
                                    {title}
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
                                    '&:hover': { backgroundColor: '#f9f9f9' }
                                }}
                            >
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.phone}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell align="center">{doc.hours}</TableCell>
                                <TableCell align="center">{doc.description || 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{doc.number}</TableCell>
                                <TableCell align="center">
                                    <CheckIcon
                                        sx={{
                                            color: doc.status === 'Đã hoàn thành' ? '#ccc' : '#4caf50',
                                            cursor: doc.status === 'Đã hoàn thành' ? 'not-allowed' : 'pointer',
                                            transition: '0.2s',
                                            '&:hover': {
                                                transform: doc.status === 'Đã hoàn thành' ? 'none' : 'scale(1.2)'
                                            }
                                        }}
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleCheck(doc.id)}
                                    />
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
        </Container>
    );
}

export default StaffReserve;
