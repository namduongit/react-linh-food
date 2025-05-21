//material-ui
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';

import { Container, Table as MuiTable, TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

//react
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminMenu = () => {
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [docs, setDocs] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
            projectFirestore.collection('menu').doc(id).delete();
        }
    }

    const handleEdit = (id) => {
        navigate(`/admin/edit-menu/${id}`);
    }

    useEffect(() => {
        projectFirestore.collection('menu')
            .orderBy('price', 'desc')
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
                            <TableCell className={classes.tableHeader} align="center">Ảnh</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Ghi chú</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Mô tả</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Đơn Giá</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Danh mục</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Phân loại</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Đơn vị</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Hoạt động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs && (rowsPerPage > 0
                            ? docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : docs
                        ).map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell align="center">{doc.name}</TableCell>
                                <TableCell align="center"><img src={doc.image} alt="dish" width="100px" height="100px" /></TableCell>
                                <TableCell align="center">{doc.subtitle}</TableCell>
                                <TableCell align="center">{doc.description ? doc.description : 'Không có mô tả'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.price)}</TableCell>
                                <TableCell align="center">{doc.category}</TableCell>
                                <TableCell align="center">{doc.type}</TableCell>
                                <TableCell align="center">{doc.unit}</TableCell>
                                <TableCell align="center">
                                    <EditIcon
                                        className={classes.editIcon}
                                        onClick={() => handleEdit(doc.id)}
                                    />
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

export default AdminMenu