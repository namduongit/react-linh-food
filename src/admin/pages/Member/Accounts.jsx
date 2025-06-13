import ClearIcon from '@mui/icons-material/Clear';
import {
    Container, Typography, Table, TableContainer, Paper,
    TableBody, TableCell, TableHead, TableRow, TableFooter,
    TablePagination, ButtonGroup, Button, IconButton
} from '@mui/material';
import { useStyles } from './styles';
import { useState, useEffect } from 'react';
import { projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';

const Staffs = () => {
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [docs, setDocs] = useState([]);
    const [selectedRole, setSelectedRole] = useState('staff');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc xóa nhân viên này không?');
        if (!confirm) return;

        try {
            await projectFirestore.collection('users').doc(id).delete();
            toast({
                title: 'Thông báo',
                message: 'Xóa thành công nhân viên',
                type: 'success',
                duration: 3000
            });
        } catch (error) {
            toast({
                title: 'Lỗi',
                message: 'Không thể xóa nhân viên',
                type: 'error',
                duration: 3000
            });
        }
    };

    useEffect(() => {
        const unsubscribe = projectFirestore.collection('users')
            .where('role', '==', selectedRole)
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({ ...doc.data(), id: doc.id });
                });
                setDocs(documents);
            });

        return () => unsubscribe();
    }, [selectedRole]);

    return (
        <Container>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý tài khoản
            </Typography>

            <ButtonGroup sx={{ mb: 2 }}>
                <Button
                    variant={selectedRole === 'staff' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedRole('staff')}
                >
                    Tài khoản nhân viên
                </Button>
                <Button
                    variant={selectedRole === 'user' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedRole('user')}
                >
                    Tài khoản người dùng
                </Button>
            </ButtonGroup>

            <TableContainer component={Paper} className={classes.container}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell align="center"><strong>ID</strong></TableCell>
                            <TableCell align="center"><strong>Tên</strong></TableCell>
                            <TableCell align="center"><strong>Email</strong></TableCell>
                            <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow key={doc.id} hover>
                                <TableCell align="center">{doc.uid}</TableCell>
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.email}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleClear(doc.id)}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={docs.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Staffs;
