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
import { showNotification } from '../../../services/showNotification';

const StaffPayment = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [seats, setSeats] = useState([]);
    const [seatID, setSeatID] = useState('');

    const [total, setTotal] = useState(0);

    function mergeCarts(oldCart, newCart) {
        const merged = [...oldCart];

        newCart.forEach(newItem => {
            const index = merged.findIndex(item => item.id === newItem.id);
            if (index !== -1) {
                // Nếu món đã tồn tại, cộng dồn số lượng
                merged[index].quantity += newItem.quantity;
            } else {
                merged.push(newItem);
            }
        });

        return merged;
    }

    function calculateTotal(cart) {
        return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }


    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            seat: 0
        },
        validationSchema: validationSeat,
        onSubmit: async values => {
            const confirm = await showNotification('Bạn có chắc đặt đơn hàng này ?');
            if (!confirm) return;

            const dineinQuery = await projectFirestore
                .collection('dinein')
                .where('seatID', '==', seatID)
                .where('status', '!=', 'Đã hoàn thành')
                .limit(1)
                .get();

            const now = new Date().toLocaleString();
            const note = localStorage.getItem('note') || '';


            if (dineinQuery.empty) {
                // Chưa có hóa đơn, tạo mới
                await projectFirestore.collection('dinein').add({
                    seatID,
                    seat: values.seat,
                    note: note,
                    total: calculateTotal(docs),
                    cart: docs,
                    status: "Chưa xác nhận",
                    checked: false,
                    date: now
                });
            } else {
                // Đã có hóa đơn -> gộp giỏ hàng
                const docRef = dineinQuery.docs[0].ref;
                const oldData = dineinQuery.docs[0].data();
                console.log(oldData)
                const oldCart = oldData.cart || [];

                const mergedCart = mergeCarts(oldCart, docs);
                const newTotal = calculateTotal(mergedCart);

                await docRef.update({
                    cart: mergedCart,
                    total: newTotal,
                    note: note,
                    date: now
                });
            }

            toast({
                title: 'Thông báo',
                message: 'Đặt hàng thành công',
                type: 'success',
                duration: 3000
            });

            localStorage.setItem('note', '');
            navigate('/staff/dinein');

            // Xoá giỏ hàng sau khi đặt
            const cart_query = projectFirestore.collection('cart').where('uid', '==', user.uid);
            const querySnapshot = await cart_query.get();
            querySnapshot.forEach((doc) => doc.ref.delete());
        },
    });


    useEffect(() => {
        projectFirestore.collection('seat')
            .where('status', '==', 'Đang có khách')
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


    useEffect(() => {
        if (user) {
            let data = 0;
            docs.forEach(doc => {
                data += doc.quantity * parseInt(doc.price);
            });
            setTotal(data);
        }
    })


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                {/* Form chọn bàn và đặt hàng */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ marginBottom: '10px' }}>
                        Thông tin giao hàng
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                        <FormControl fullWidth>
                            <InputLabel id="seat-label" sx={{ marginBottom: '10px' }}>Chọn số bàn</InputLabel>
                            <Select
                                labelId="seat-label"
                                id="seat"
                                name="seat"
                                value={formik.values.seat}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                }}
                                error={formik.touched.seat && Boolean(formik.errors.seat)}
                            >
                                <MenuItem value={0} disabled hidden>
                                    -- Chưa chọn --
                                </MenuItem>
                                {seats.map((seat) => (
                                    <MenuItem
                                        key={seat.id}
                                        value={seat.number}
                                        onClick={() => setSeatID(seat.id)}
                                    >
                                        SN: {seat.number} - {seat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.seat && formik.errors.seat && (
                                <FormHelperText sx={{ color: 'error.main' }}>
                                    {formik.errors.seat}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <Box mt={4}>
                            <Card sx={{ p: 2, boxShadow: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Button variant="text" component={RouterLink} to="/cart">
                                        Quay lại giỏ hàng
                                    </Button>
                                    <Button variant="contained" color="warning" type="submit">
                                        Đặt mua
                                    </Button>
                                </Box>
                            </Card>
                        </Box>
                    </form>
                </Grid>

                {/* Danh sách món trong giỏ hàng */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Thông tin giỏ hàng
                    </Typography>

                    {docs.length === 0 ? (
                        <Typography>Chưa có sản phẩm nào trong giỏ.</Typography>
                    ) : (
                        docs.map((cart) => (
                            <Card
                                key={cart.id}
                                sx={{
                                    display: 'flex',
                                    mb: 2,
                                    p: 1.5,
                                    boxShadow: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <Badge
                                    badgeContent={cart.quantity}
                                    color="error"
                                    sx={{ mr: 2 }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={cart.image}
                                        alt={cart.name}
                                        sx={{ width: 90, height: 90, borderRadius: 2 }}
                                    />
                                </Badge>

                                <Box flexGrow={1}>
                                    <Typography fontWeight="bold">{cart.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {currencyFormat(cart.price)} / {cart.unit}
                                    </Typography>
                                </Box>

                                <Typography fontWeight="bold" color="primary">
                                    {currencyFormat(cart.price * cart.quantity)} đ
                                </Typography>
                            </Card>
                        ))
                    )}

                    <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Tổng tiền:</Typography>
                        <Typography variant="h5" fontWeight="bold" color="error">
                            {currencyFormat(total)} đ
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );

}

export default StaffPayment