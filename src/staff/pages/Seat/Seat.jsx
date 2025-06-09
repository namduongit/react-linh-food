import { useStyles } from './styles';
import { useEffect, useState } from 'react'

import { Box, Button, Avatar, Container, Grid, Typography, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';

import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';

const Seat = () => {
    const classes = useStyles();
    const [userBill, setUserBill] = useState([]);
    const [seatState, setSeatState] = useState([]);

    const [seatName, setSeateName] = useState('');
    const [seatNumber, setSeatNumber] = useState(0);

    const handleSeat = async (available, number, id) => {
        const seatTotal = userBill.find(seat => parseInt(seat.userSeat) === number);
        if (seatTotal) {
            if (available === true) {
                projectFirestore.collection('seat').doc(id).update({
                    total: seatTotal.total,
                    available: false,
                });
            } else {
                const confirm = await showNotification('Thanh toán đơn hàng?');
                if (!confirm) return;
                projectFirestore.collection('seat').doc(id).update({
                    total: 0,
                    available: true,
                });
                projectFirestore.collection('dinein').doc(seatTotal.id).update({
                    checked: true
                });
                toast({
                    title: 'Thông báo',
                    message: `Thanh toán đơn hàng ${id} thành công`,
                    type: 'success',
                    duration: 3000
                })
            }

        }
    }
    const handleClear = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
            projectFirestore.collection('seat').doc(id).delete();
        }
    }
    const handleAddSeat = () => {
        if (seatNumber > 0) {
            projectFirestore.collection('seat').add({
                name: seatName,
                number: seatNumber,
                available: true,
                total: 0,
            })
        } else {
            toast({
                title: 'Thông báo',
                message: 'Số người ngồi phải lớn hơn 0',
                type: 'success',
                duration: 3000
            });
        }

    }

    useEffect(() => {
        projectFirestore.collection('dinein')
            .where('checked', '==', false)
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setUserBill(documents);
            })

        projectFirestore.collection('seat')
            .orderBy('number', 'asc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setSeatState(documents);
            })

        return () => {
            setSeatState([]);
            setUserBill([])
        };
    }, [setSeatState, setUserBill]);

    return (
        <Container className={classes.root}>
            <Typography variant="h4" component="h1" className={classes.title}>
                Quản lý chỗ ngồi
            </Typography>
            <Grid container justifyContent="center" alignItems="center">
                {seatState && seatState.map(seat =>
                    <Grid item xs={4} key={seat.id}>
                        <Box
                            variant="contained"
                            className={seat.available ? classes.button : classes.buttonRed}
                            onClick={() => handleSeat(seat.available, seat.number, seat.id)}
                        >
                            <Box>
                                <Typography>
                                    Seat {seat.number} - Name {seat.name}
                                </Typography>
                                <Typography>
                                    Tổng {currencyFormat(seat.total)} đ
                                </Typography>
                            </Box>
                            <ClearIcon
                                className={classes.clearIcon}
                                onClick={() => handleClear(seat.id)}
                            />
                        </Box>
                    </Grid>
                )}
            </Grid>
            <Typography variant="h4" component="h1" className={classes.title}>
                Thêm chỗ ngồi
            </Typography>
            <Box className={classes.form}>
                <TextField
                    label="Tên bàn"
                    fullWidth
                    value={seatName}
                    onChange={(event) => setSeateName(event.target.value)}
                    sx={{
                        marginTop: "10px"
                    }}
                />

                <TextField
                    label="Số người"
                    fullWidth
                    value={seatNumber}
                    onChange={(event) => setSeatNumber(event.target.value)}
                    sx={{
                        marginTop: "10px"
                    }}
                />
                <Button onClick={handleAddSeat}>
                    Thêm
                </Button>
            </Box>
        </Container>
    )
}

export default Seat