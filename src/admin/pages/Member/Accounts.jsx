//material-ui
import ClearIcon from '@mui/icons-material/Clear';
import { Container, Typography, Table, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, ButtonGroup, Button } from '@mui/material';
import { useStyles } from './styles';


//react
import { useState, useEffect } from 'react';

//firebase
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
        const confirm = await showNotification('Bạn có chắc xóa nhân viên này không ?');
        if (!confirm) return;
        toast({
            title: 'Thông báo',
            message: 'Xóa thành công nhân viên',
            type: 'success',
            duration: 3000
        });
    }


    useEffect(() => {
        const unsubscribe = projectFirestore.collection('users')
            .where('role', '==', selectedRole)
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setDocs(documents)
            });

        return () => unsubscribe(); // cleanup khi unmount hoặc đổi role
    }, [selectedRole]);



    useEffect(() => {
        projectFirestore.collection('users')
            .where('role', '==', 'staff')
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

    }, [])

    return (
        <Container>
            <Typography variant="h4" component="h1" className={classes.title}>
                Quản lý tài khoản
            </Typography>
            <ButtonGroup style={{ marginBottom: 16 }}>
                <Button style={{ marginRight: 16 }}
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
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Name</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Email</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs && (rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell align="center">{doc.uid}</TableCell>
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center">{doc.email}</TableCell>
                                <TableCell align="center">
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
    )
}

export default Staffs