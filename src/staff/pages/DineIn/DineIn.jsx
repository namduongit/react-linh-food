//material-ui
import ClearIcon from '@mui/icons-material/Clear';

import { Container, ButtonGroup, Button, Table as MuiTable, TableContainer, TextField, MenuItem, Paper, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination, Typography, Box } from '@mui/material';
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat'

//react
import { useState, useEffect } from 'react';
import { showNotification } from '../../../services/showNotification';
import { toast } from '../../../services/toast';

import { useNavigate } from 'react-router-dom';
import { useLocation, Link } from 'react-router-dom';

const DineIn = () => {
    const classes = useStyles();
    const statusArray = ["Chưa xác nhận", "Đã xác nhận", "Nhà hàng đang chuẩn bị món", "Đã hoàn thành"]
    const [page, setPage] = useState(0);
    const [docs, setDocs] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const location = useLocation();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClear = async (id, seatID) => {
        const confirm = await showNotification('Bạn có chắc chắn muốn xóa hóa đơn này ?');
        if (!confirm) return;
        projectFirestore.collection('dinein').doc(id).delete();
        projectFirestore.collection('seat').doc(seatID).update({
            total: 0,
            available: true,
        });
        toast({
            title: 'Thông báo',
            message: `Xóa thành công hóa đơn ${id}`,
            type: 'success',
            duration: 3000
        })
    }

    const handleStatus = async (event, id, seatID) => {
        projectFirestore.collection('dinein').doc(id).update("status", event.target.value);
        if (event.target.value === 'Đã hoàn thành') {
            const confirm = await showNotification('Chắc chắn hoàn tất đơn hàng?');
            if (confirm) {
                projectFirestore.collection('dinein').doc(id).update("checked", true)
                projectFirestore.collection('seat').doc(seatID).update({
                    total: 0,
                    available: true,
                })
                toast({
                    title: 'Thông báo',
                    message: `Hoàn tất đơn hàng ${id} thành công`,
                    type: 'success',
                    duration: 3000
                })

            } else {
                projectFirestore.collection('dinein').doc(id).update({
                    checked: false,
                    status: 'Nhà hàng đang chuẩn bị món'
                })
            }
        } else {
            projectFirestore.collection('dinein').doc(id).update({
                checked: false,
                status: event.target.value
            });
            projectFirestore.collection('seat').doc(seatID).update({
                available: false,
            })
        }
    }

    useEffect(() => {
        projectFirestore.collection('dinein')
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
            <ButtonGroup style={{ marginBottom: 16, marginTop: 16 }}>
                <Button
                    component={Link}
                    to="/dinein"
                    variant={location.pathname === '/dinein' ? 'contained' : 'outlined'}
                    style={{ marginRight: 16 }}
                >
                    Đơn hàng tại chỗ
                </Button>
                <Button
                    component={Link}
                    to="/order"
                    variant={location.pathname === '/order' ? 'contained' : 'outlined'}
                >
                    Đơn hàng vận chuyển
                </Button>
            </ButtonGroup>

            <TableContainer component={Paper} className={classes.container}>
                <MuiTable sx={{ minWidth: 650 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader} align="center">Số bàn</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Thời gian</TableCell>
                            <TableCell className={classes.tableHeader} align="center">Chi tiết đơn hàng</TableCell>
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
                                <TableCell align="center">{doc.seat}</TableCell>
                                <TableCell align="center">{doc.date}</TableCell>
                                <TableCell>
                                    {doc.cart.map(cart => (
                                        <Box key={cart.id}>
                                            <Typography style={{ fontWeight: 'bold' }}>{cart.name}</Typography>
                                            <Typography>Số lượng: {cart.quantity}</Typography>
                                        </Box>
                                    ))}
                                </TableCell>
                                <TableCell align="center">{doc.note ? doc.note : 'Không có ghi chú'}</TableCell>
                                <TableCell align="center">{currencyFormat(doc.total)}</TableCell>
                                <TableCell align="center">
                                    <TextField
                                        select
                                        value={doc.status}
                                        onChange={(event) => handleStatus(event, doc.id, doc.seatID)}
                                    >
                                        {statusArray.map((role, index, status) => (
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
                                        onClick={doc.status === 'Đã hoàn thành' ? undefined : () => handleClear(doc.id, doc.seatID)}
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

export default DineIn