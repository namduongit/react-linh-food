//material-ui
import ClearIcon from '@mui/icons-material/Clear';
import { Container, TextField, MenuItem, Typography, Table, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination } from '@mui/material';
import { useStyles } from './styles';

//react
import { useState, useEffect } from 'react';

//firebase
import { projectFirestore } from '../../../firebase/config';

const AdminRole = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const rolesArray = ['admin', 'staff', 'user'];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRole = (event, id) => {
        projectFirestore.collection('users').doc(id).update({
            role: event.target.value
        })
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
            projectFirestore.collection('users').doc(id).delete();
        }
    }

    useEffect(() => {
        projectFirestore.collection('users')
            .orderBy('role', 'asc')
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
    }, [setDocs]);

    console.log(docs);

    return (
        <Container>
            <Typography variant="h3" component="h1" className={classes.title}>
                Thay đổi phân quyền
            </Typography>
            <TableContainer component={Paper} className={classes.container}>
                <Table sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">ID</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Name</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Email</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Role</TableCell>
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
                                    <TextField
                                        select
                                        value={doc.role}
                                        onChange={(event) => handleRole(event, doc.id)}
                                    >
                                        {rolesArray.map((role, index) => (
                                            <MenuItem
                                                key={index}
                                                value={role}
                                            >
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
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

export default AdminRole