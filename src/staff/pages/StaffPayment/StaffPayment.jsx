import { useState, useEffect } from 'react'
import { useStyles } from './styles';
import { Container, Link as MaterialLink, FormHelperText, Typography, TextField, Grid, Box, FormControl, InputLabel, Select, MenuItem, Card, CardContent, CardActions, Button, CardMedia, Badge } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { projectFirestore, projectAuth } from '../../../firebase/config';
import { useFormik } from 'formik';
import { validationSeat } from '../../../utils/validate';
import { currencyFormat } from '../../../utils/currencyFormat';
import useGetProvinces from '../../../services/province';
import { useAuthState } from "react-firebase-hooks/auth";

import { toast } from '../../../services/toast';

const StaffPayment = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [seats, setSeats] = useState([]);
    const [seatID, setSeatID] = useState('');

    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            seat: 0
        },
        validationSchema: validationSeat,
        onSubmit: values => {
            projectFirestore.collection('seat').doc(seatID).update({
                available: false,
                total: localStorage.getItem('total'),
                date: new Date().toLocaleString(),
            })
            projectFirestore.collection('dinein').add({
                seatID,
                seat: values.seat,
                note: localStorage.getItem('note'),
                total: localStorage.getItem('total'),
                cart: docs,
                status: "Chưa xác nhận",
                checked: false,
                date: new Date().toLocaleString(),
            })
            toast({
                title: 'Thông báo',
                message: 'Đặt hàng thành công',
                type: 'success',
                duration: 3000
            });
            localStorage.setItem('note', '');
            navigate('/staff/dinein');
            const cart_query = projectFirestore.collection('cart').where('uid', '==', JSON.parse(localStorage.getItem('user')).uid);
            cart_query.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        },
    });

    useEffect(() => {
        projectFirestore.collection('seat')
            .where('available', '==', true)
            .orderBy('number', 'asc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setSeats(documents)
            })

        if (user) {
            projectFirestore.collection('cart')
                .where('uid', '==', user.uid)
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
        }
    }, [setDocs, setSeats, user]);

    return (
        <Container className={classes.container}>
            <Grid container spacing={3}>
                <Grid item md={7} style={{ paddingRight: '20px' }}>
                    <form onSubmit={formik.handleSubmit}>
                        <Box>
                            <Typography variant="h4" style={{ marginBottom: '10px' }}>
                                Thông tin giao hàng
                            </Typography>
                            <FormControl fullWidth >
                                <InputLabel >Chọn số bàn</InputLabel>
                                <Select
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                    }}
                                    value={formik.values.seat}
                                    id="seat"
                                    name="seat"
                                    error={formik.touched.seat && Boolean(formik.errors.seat)}
                                >
                                    <MenuItem
                                        disabled
                                        hidden
                                        value={0}
                                    >
                                        Chưa chọn
                                    </MenuItem>
                                    {seats.map(seat => (
                                        <MenuItem
                                            key={seat.id}
                                            value={seat.number}
                                            onClick={() => setSeatID(seat.id)}
                                        >
                                            {seat.number}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.seat && formik.errors.seat ? (
                                    <FormHelperText
                                        sx={{ color: "#bf3333" }}
                                    >
                                        {formik.touched.seat && formik.errors.seat}
                                    </FormHelperText>
                                ) : null}
                            </FormControl>
                        </Box>
                        <Card style={{ marginTop: '10px' }}>
                            <hr />
                            <CardActions style={{ display: 'flex' }}>
                                <Box style={{ flexGrow: 1 }}>
                                    <Button
                                        className={classes.total}
                                        color="primary"
                                        variant="text"
                                    >
                                        <MaterialLink
                                            color="inherit"
                                            underline="none"
                                            component={RouterLink} to='/Cart'
                                        >
                                            Quay lại giỏ hàng
                                        </MaterialLink>
                                    </Button>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    type="submit"
                                >
                                    Đặt mua
                                </Button>
                            </CardActions>
                        </Card>
                    </form>
                </Grid>
                <Grid item md={5} style={{ borderLeft: '2px solid #ccc' }}>
                    <Typography variant="h4">
                        Thông tin giỏ hàng
                    </Typography>
                    {docs.map(cart => (
                        <Card
                            key={cart.id}
                            sx={{
                                display: 'flex',
                                margin: '10px 0',
                                position: 'relative',
                                padding: '10px'
                            }}
                        >
                            <Badge
                                badgeContent={cart.quantity}
                                color="error"
                            >
                                <CardMedia
                                    component="img"
                                    image={cart.image}
                                    style={{ width: 100 }}
                                />
                            </Badge>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <CardContent>
                                        <Typography sx={{ width: "370px" }}>
                                            {cart.name}
                                        </Typography>
                                        <Typography>
                                            {currencyFormat(cart.price)}/{cart.unit}
                                        </Typography>
                                    </CardContent>
                                </Box>
                                <Typography style={{ position: 'absolute', bottom: 10, right: 20 }}>
                                    Tạm tính: {currencyFormat(cart.price * cart.quantity)} đ
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                    <Box className={classes.total}>
                        <Typography variant="h5" style={{ flexGrow: 1 }}>
                            Tổng tiền
                        </Typography>
                        <Typography variant='h4'>
                            {currencyFormat(localStorage.getItem('total'))} vnđ
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    )
}

export default StaffPayment