import ClearIcon from '@mui/icons-material/Clear';
import {
    Container, Typography, Table, TableContainer, Paper, TableBody,
    TableCell, TableHead, TableRow, TableFooter, TablePagination,
    IconButton, MenuItem, FormControl, InputLabel, Select, Card, CardContent
} from '@mui/material';

import { useState, useEffect } from 'react';
import { projectAuth, projectFirestore } from '../../../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';

const AdminRole = () => {
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [user] = useAuthState(projectAuth);
    const rolesArray = ['admin', 'staff', 'user'];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRole = (event, id) => {
        projectFirestore.collection('users').doc(id).update({
            role: event.target.value,
        });
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id, uid) => {
        if (uid === user.uid) {
            toast({
                title: 'Cảnh báo',
                message: 'Bạn không thể xóa tài khoản của mình',
                type: 'warning',
                duration: 3000,
            });
            return;
        }

        const confirm = await showNotification('Bạn có chắc chắn xóa tài khoản này?');
        if (!confirm) return;

        await projectFirestore.collection('users').doc(id).delete();
    };

    useEffect(() => {
        const unsubscribe = projectFirestore
            .collection('users')
            .orderBy('role', 'asc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach((doc) => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id,
                    });
                });
                setDocs(documents);
            });

        return () => unsubscribe();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý chỗ ngồi
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell align="center"><strong>ID</strong></TableCell>
                                    <TableCell align="center"><strong>Tên</strong></TableCell>
                                    <TableCell align="center"><strong>Email</strong></TableCell>
                                    <TableCell align="center"><strong>Phân quyền</strong></TableCell>
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
                                            <FormControl fullWidth variant="standard" size="small">
                                                <Select
                                                    value={doc.role}
                                                    onChange={(e) => handleRole(e, doc.id)}
                                                    disabled={user.uid === doc.uid}
                                                >
                                                    {rolesArray.map((role, index) => (
                                                        <MenuItem key={index} value={role}>
                                                            {role}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleClear(doc.id, doc.uid)}
                                                disabled={user.uid === doc.uid}
                                                color="error"
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
                </CardContent>
            </Card>
        </Container>
    );
};

export default AdminRole;
