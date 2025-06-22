import { useStyles } from './styles';
import {
    Container, FormControlLabel, Link as MaterialLink, Radio, RadioGroup,
    FormHelperText, Typography, TextField, Grid, Box, FormControl,
    InputLabel, Select, MenuItem, Card, CardContent, CardActions, Button,
    CardMedia, Badge
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { projectFirestore, projectAuth } from '../../firebase/config';
import { useFormik } from 'formik';
import { validationSchema } from '../../utils/validate';
import { currencyFormat } from '../../utils/currencyFormat';
import useGetProvinces from '../../services/province';
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from 'react';

import { toast } from '../../services/toast';
import { showNotification } from '../../services/showNotification';

const Payment = () => {
    const [user] = useAuthState(projectAuth);
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const { provinces } = useGetProvinces();
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [units, setUnits] = useState([]);

    const [total, setTotal] = useState(0);

    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            address: '',
            province: 0,
            district: 0,
            ward: 0,
            payment: 'cod'
        },
        validationSchema: validationSchema,
        onSubmit: async values => {
            const confirm = await showNotification('Bạn chắc chắn đặt đơn hàng này ?');
            if (!confirm) return;

            projectFirestore.collection('order').add({
                name: values.name,
                phone: values.phone,
                address: values.address,
                province: selectedProvince.name,
                district: selectedDistrict.name,
                ward: selectedWard.name,
                payment: values.payment,
                note: localStorage.getItem('note'),
                userID: user.uid,
                total: total,
                cart: docs,
                status: "Chưa xác nhận",
                checked: false,
                date: new Date().toLocaleString(),
            });
            toast({
                title: 'Thông báo',
                message: 'Đặt hàng thành công',
                type: 'success',
                duration: 3000
            });
            localStorage.removeItem('note');
            navigate('/');
            const cart_query = projectFirestore.collection('cart').where('uid', '==', user.uid);
            cart_query.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        },
    });

    const selectedProvince = provinces.find(province => province.code === formik.values.province);
    const selectedDistrict = districts.find(district => district.code === formik.values.district);
    const selectedWard = wards.find(ward => ward.code === formik.values.ward);

    useEffect(() => {
        if (user) {
            projectFirestore.collection('cart')
                .where('uid', '==', user.uid)
                .onSnapshot((snap) => {
                    let documents = [];
                    snap.forEach(doc => {
                        documents.push({
                            ...doc.data(),
                            id: doc.id
                        });
                    });
                    setDocs(documents);
                });
        }
    }, [setDocs]);

    useEffect(() => {
        if (user) {
            let data = 0;
            docs.forEach(doc => {
                data += doc.quantity * parseInt(doc.price);
            });
            setTotal(data);
        }
    });

    useEffect(() => {
        const fetchDistricts = async () => {
            if (formik.values.province) {
                const response = await fetch(`https://provinces.open-api.vn/api/p/${formik.values.province}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts);
                setWards([]);
            }
        };
        fetchDistricts();
    }, [formik.values.province]);

    useEffect(() => {
        const fetchWards = async () => {
            if (formik.values.district) {
                const response = await fetch(`https://provinces.open-api.vn/api/d/${formik.values.district}?depth=2`);
                const data = await response.json();
                setWards(data.wards);
            }
        };
        fetchWards();
    }, [formik.values.district]);

    useEffect(() => {
        const fetchUnits = async () => {
            const snap = await projectFirestore.collection('units').get();
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUnits(data);
        };
        fetchUnits();
    }, []);

    const getUnitLabel = (unitId) => {
        const found = units.find(u => u.id === unitId);
        return found ? found.value : unitId;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* ... giữ nguyên nội dung form */}

            <Grid item xs={12} md={5}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Thông tin giỏ hàng
                </Typography>

                {docs.length === 0 ? (
                    <Typography>Chưa có sản phẩm nào trong giỏ.</Typography>
                ) : (
                    docs.map((cart) => (
                        <Card key={cart.id} sx={{ display: 'flex', mb: 2, p: 1.5 }}>
                            <Badge badgeContent={cart.quantity} color="error" sx={{ mr: 2 }}>
                                <CardMedia
                                    component="img"
                                    image={cart.image}
                                    sx={{ width: 80, height: 80, borderRadius: 1 }}
                                />
                            </Badge>
                            <Box flexGrow={1}>
                                <Typography fontWeight="bold">{cart.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {currencyFormat(cart.price)} / {getUnitLabel(cart.unit)}
                                </Typography>
                                <Typography fontWeight="bold" sx={{ mt: 1 }} color="primary">
                                    Tạm tính: {currencyFormat(cart.price * cart.quantity)} đ
                                </Typography>
                            </Box>
                        </Card>
                    ))
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Tổng tiền:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error">
                        {currencyFormat(total)} đ
                    </Typography>
                </Box>
            </Grid>
        </Container>
    );
};

export default Payment;
