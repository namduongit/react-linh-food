import { useStyles } from './styles';
import { useEffect, useState } from 'react';
import {
    Box, Button, Container, Grid, Typography, TextField,
    Select, MenuItem, InputLabel, FormControl, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';
import { doc, updateDoc, deleteDoc, addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';
import { QRCodeCanvas } from 'qrcode.react';


const Seat = () => {
    const classes = useStyles();
    const [userBill, setUserBill] = useState([]);
    const [seatState, setSeatState] = useState([]);

    const [seatName, setSeatName] = useState('');
    const [seatNumber, setSeatNumber] = useState(0);

    const [seatNameEdit, setSeatNameEdit] = useState('');
    const [seatTotalEdit, setseatTotalEdit] = useState(0);
    const [seatStatusEdit, setSeatStatusEdit] = useState('');

    const [filterAvailable, setFilterAvailable] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleEditSeat = (seat) => {
        setSelectedSeat(seat);
        setSeatNameEdit(seat.name);
        setseatTotalEdit(seat.total);
        setSeatStatusEdit(seat.available);
    };

    const handleSaveEdit = async () => {
        if (selectedSeat.total > 0) {
            toast({ title: 'Thông báo', message: 'Đang có hóa đơn chưa xử lý cho bàn này', type: 'warning', duration: 3000 });
            return;
        }
        const confirm = await showNotification('Bạn có chắc sự chỉnh sửa của mình ?');
        if (!confirm) return;

        await updateDoc(doc(projectFirestore, 'seat', selectedSeat.id), {
            name: seatNameEdit,
            number: parseInt(seatTotalEdit),
            available: seatStatusEdit
        });

        toast({ title: 'Thông báo', message: 'Cập nhật thông tin bàn thành công', type: 'success', duration: 3000 });
        setOpenDialog(false);
    };

    const handleSeat = async (available, number, id) => {
        const seatTotal = userBill.find(seat => parseInt(seat.userSeat) === number);
        if (seatTotal) {
            if (available === true) {
                await updateDoc(doc(projectFirestore, 'seat', id), {
                    total: seatTotal.total,
                    available: false,
                });
            } else {
                const confirm = await showNotification('Thanh toán đơn hàng?');
                if (!confirm) return;
                await updateDoc(doc(projectFirestore, 'seat', id), {
                    total: 0,
                    available: true,
                });
                await updateDoc(doc(projectFirestore, 'dinein', seatTotal.id), {
                    checked: true
                });
                toast({ title: 'Thông báo', message: `Thanh toán đơn hàng ${id} thành công`, type: 'success', duration: 3000 });
            }
        }
    };

    const handleClear = async (id) => {
        if (!selectedSeat) {
            toast({ title: 'Thông báo', message: 'Bạn chưa chọn bàn nào để xóa', type: 'warning', duration: 3000 });
            return;
        }
        if (selectedSeat.total > 0) {
            toast({ title: 'Thông báo', message: 'Đang có hóa đơn chưa xử lý cho bàn này', type: 'warning', duration: 3000 });
            return;
        }
        const confirm = await showNotification('Bạn có chắc chắn bỏ bàn này ?');
        if (!confirm) return;
        await deleteDoc(doc(projectFirestore, 'seat', id));
        toast({ title: 'Thông báo', message: 'Xóa bàn thành công', type: 'success', duration: 3000 });
    };

    const handleAddSeat = async () => {
        if (seatNumber <= 0 || !seatName) {
            toast({ title: 'Thông báo', message: 'Vui lòng điền đúng thông tin', type: 'warning', duration: 3000 });
            return;
        }
        const nameExists = seatState.some(seat => seat.name.toLowerCase() === seatName.toLowerCase());
        if (nameExists) {
            toast({ title: 'Thông báo', message: 'Tên bàn đã tồn tại', type: 'warning', duration: 3000 });
            return;
        }
        const confirm = await showNotification('Bạn có chắc thêm bàn này ?');
        if (!confirm) return;
        await addDoc(collection(projectFirestore, 'seat'), {
            name: seatName,
            number: parseInt(seatNumber),
            available: true,
            total: 0,
        });
        toast({ title: 'Thông báo', message: 'Thêm bàn thành công', type: 'success', duration: 3000 });
        setSeatName('');
        setSeatNumber(0);
    };

    const filteredSeats = seatState
        .filter(seat => filterAvailable === 'all' || seat.available === (filterAvailable === 'available'))
        .sort((a, b) => sortOrder === 'asc' ? a.number - b.number : b.number - a.number);

    useEffect(() => {
        const unsubDinein = onSnapshot(query(collection(projectFirestore, 'dinein'), where('checked', '==', false)), (snap) => {
            const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUserBill(documents);
        });

        const unsubSeat = onSnapshot(collection(projectFirestore, 'seat'), (snap) => {
            const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setSeatState(documents);
        });

        return () => {
            unsubDinein();
            unsubSeat();
        };
    }, []);

    return (
        <Container className={classes.root} sx={{ marginBottom: '50px' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý chỗ ngồi
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">Thêm / Sửa chỗ ngồi</Typography>
                    <Box className={classes.form}>
                        <TextField
                            label="Tên bàn"
                            fullWidth
                            value={seatName}
                            onChange={(e) => setSeatName(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            label="Số bàn"
                            fullWidth
                            type="number"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            margin="normal"
                        />
                        <Button variant="contained" color="primary" onClick={handleAddSeat} fullWidth>Thêm</Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box display="flex" justifyContent="left" alignItems="center">
                        <FormControl sx={{ marginRight: '20px', width: '150px' }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)} label="Trạng thái">
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="available">Trống</MenuItem>
                                <MenuItem value="unavailable">Đang dùng</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ marginRight: '20px', width: '150px' }}>
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} label="Sắp xếp">
                                <MenuItem value="asc">Tăng dần</MenuItem>
                                <MenuItem value="desc">Giảm dần</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" sx={{ marginRight: '20px', width: '150px' }} onClick={() => {
                            if (!selectedSeat) {
                                toast({ title: 'Thông báo', message: 'Bạn chưa chọn bàn nào để sửa', type: 'warning', duration: 3000 });
                                return;
                            }
                            setOpenDialog(true)
                        }}>Sửa</Button>
                        <Button variant="outlined" color="error" sx={{ marginRight: '20px', width: '150px' }} onClick={() => {
                            if (!selectedSeat) {
                                toast({ title: 'Thông báo', message: 'Bạn chưa chọn bàn nào để xóa', type: 'warning', duration: 3000 });
                                return;
                            }
                            handleClear(selectedSeat.id)
                        }}>Xóa</Button>
                    </Box>

                    <Grid container spacing={2} alignItems="stretch" sx={{ marginTop: '20px' }}>
                        {filteredSeats.map(seat => (
                            <Grid item xs={12} sm={6} md={4} key={seat.id}>
                                <Box
                                    onClick={() => { handleSeat(seat.available, seat.number, seat.id); handleEditSeat(seat); }}
                                    p={2}
                                    borderRadius={2}
                                    boxShadow={selectedSeat?.id === seat.id ? 4 : 2}
                                    height="100%"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedSeat?.id === seat.id ? '2px solid #1976d2' : 'none',
                                        backgroundColor: selectedSeat?.id === seat.id ? '#e3f2fd' : 'inherit',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        transform: selectedSeat?.id === seat.id ? 'scale(1.03)' : 'none',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1">Bàn {seat.number} - {seat.name}</Typography>
                                        <Typography variant="body2">Tổng: {currencyFormat(seat.total)} đ</Typography>
                                        <Typography variant="body2">
                                            Trạng thái: {seat.available ? 'Trống' : 'Đang có khách'}
                                        </Typography>
                                    </Box>
                                    <Box mt={2} display="flex" justifyContent="center">
                                        <QRCodeCanvas value={"Tên bàn: "+ seat.name} size={100} />
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}>
                <DialogTitle>Chỉnh sửa bàn</DialogTitle>
                <DialogContent>
                    <TextField label="Tên bàn" fullWidth value={seatNameEdit} onChange={(e) => setSeatNameEdit(e.target.value)} margin="normal" />
                    <TextField label="Tổng tiền" type="number" fullWidth value={seatTotalEdit} disabled margin="normal" />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={seatStatusEdit ? 'available' : 'unavailable'}
                            onChange={(e) => setSeatStatusEdit(e.target.value === 'available')}
                            label="Trạng thái"
                        >
                            <MenuItem value="available">Trống</MenuItem>
                            <MenuItem value="unavailable">Đang có khách</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Hủy</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Seat;
