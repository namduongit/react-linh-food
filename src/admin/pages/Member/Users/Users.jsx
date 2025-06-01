//material-ui
import ClearIcon from '@mui/icons-material/Clear';
import { Container, Typography, Table, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination } from '@mui/material';
import { useStyles } from './styles';

//react
import { useState, useEffect } from 'react';

//firebase
import { projectFirestore } from '../../../../firebase/config';
import { showNotification } from '../../../../services/showNotification';

const Users = () => {

    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [docs, setDocs] = useState([]);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc chắn xóa tài khoản này không ?');
        if (!confirm) return;
        projectFirestore.collection('users').doc(id).delete();
    }

    useEffect(() => {
        projectFirestore.collection('users')
            .where('role', '==', 'user')
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

    console.log(docs)

    return (
        <Container>
            <Typography variant="h3" component="h1" className={classes.title}>
                Quản lý người dùng
            </Typography>
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

export default Users