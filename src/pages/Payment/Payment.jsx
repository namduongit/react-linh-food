



import { useStyles } from './styles';
import { Container, FormControlLabel, Link as MaterialLink, Radio, RadioGroup, FormHelperText, Typography, TextField, Grid, Box, FormControl, InputLabel, Select, MenuItem, Card, CardContent, CardActions, Button, CardMedia, Badge } from '@mui/material';
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

    const [total, setTotal] = useState(0);

    // console.log(provinces);
    // console.log(districts);

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
            })
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

    // Mapping - Dò lại dữ liệu
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
                        })
                    });
                    setDocs(documents)
                })
        }
    }, [setDocs]);

    // Xử lý tổng tiền
    useEffect(() => {
        if (user) {
            let data = 0;
            docs.forEach(doc => {
                data += doc.quantity * parseInt(doc.price);
            });
            setTotal(data);
        }
    })

    // Xử lý phần quận, huyện
    useEffect(() => {
        const fetchDistricts = async () => {
            if (formik.values.province) {
                const response = await fetch(`https://provinces.open-api.vn/api/p/${formik.values.province}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts); // districts nằm trong field `districts`
                setWards([]); // reset xã/phường nếu chọn lại tỉnh
            }
        };
        fetchDistricts();
    }, [formik.values.province]);

    // Xử lý phần phường
    useEffect(() => {
        const fetchWards = async () => {
            if (formik.values.district) {
                const response = await fetch(`https://provinces.open-api.vn/api/d/${formik.values.district}?depth=2`);
                const data = await response.json();
                setWards(data.wards); // wards nằm trong field `wards`
            }
        };
        fetchWards();
    }, [formik.values.district]);


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                {/* Form thông tin giao hàng và thanh toán */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Thông tin giao hàng
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            label="Họ và tên"
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            id="phone"
                            name="phone"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Địa chỉ"
                            id="address"
                            name="address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            error={formik.touched.address && Boolean(formik.errors.address)}
                            helperText={formik.touched.address && formik.errors.address}
                            sx={{ mb: 2 }}
                        />

                        {/* Chọn địa chỉ hành chính */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Thành phố</InputLabel>
                                <Select
                                    name="province"
                                    value={formik.values.province}
                                    onChange={(e) => {
                                        formik.setFieldValue('district', 0);
                                        formik.setFieldValue('ward', 0);
                                        formik.handleChange(e);
                                    }}
                                    error={formik.touched.province && Boolean(formik.errors.province)}
                                >
                                    <MenuItem value={0} disabled hidden>Chưa chọn</MenuItem>
                                    {provinces.map(province => (
                                        <MenuItem key={province.code} value={province.code}>
                                            {province.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.province && formik.errors.province && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {formik.errors.province}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Quận/Huyện</InputLabel>
                                <Select
                                    name="district"
                                    value={formik.values.district}
                                    onChange={(e) => {
                                        formik.setFieldValue('ward', 0);
                                        formik.handleChange(e);
                                    }}
                                    error={formik.touched.district && Boolean(formik.errors.district)}
                                >
                                    <MenuItem value={0} disabled hidden>Chưa chọn</MenuItem>
                                    {districts.map(district => (
                                        <MenuItem key={district.code} value={district.code}>
                                            {district.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.district && formik.errors.district && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {formik.errors.district}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Phường/Xã</InputLabel>
                                <Select
                                    name="ward"
                                    value={formik.values.ward}
                                    onChange={formik.handleChange}
                                    error={formik.touched.ward && Boolean(formik.errors.ward)}
                                >
                                    <MenuItem value={0} disabled hidden>Chưa chọn</MenuItem>
                                    {wards.map(ward => (
                                        <MenuItem key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.ward && formik.errors.ward && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {formik.errors.ward}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Box>

                        {/* Phương thức thanh toán */}
                        <Typography variant="h5" sx={{ mt: 3 }}>Phương thức thanh toán</Typography>
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <FormControl>
                                    <RadioGroup
                                        name="payment"
                                        value={formik.values.payment}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel
                                            value="cod"
                                            control={<Radio />}
                                            label="Thanh toán khi nhận hàng (COD)"
                                        />
                                        <FormControlLabel
                                            value="transfer"
                                            control={<Radio />}
                                            label="Chuyển khoản ngân hàng"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                {formik.values.payment === 'transfer' && (
                                    <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Quét mã QR để chuyển khoản:
                                        </Typography>
                                        <img
                                            src={`https://api.toolhub.app/vietnamese/VietQR?accountNo=50066668888&accountName=NINH%20DUC%20LINH&acqId=970423%3A%20TPBank&amount=${total}&addInfo=ThanhToan-LinhSeaFood&format=text&template=compact`}
                                            alt="QR chuyển khoản"
                                            style={{ maxWidth: 300 }}
                                        />
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Nội dung: <b>ThanhToan-LinhSeaFood</b>
                                        </Typography>
                                    </Box>
                                )}

                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                <Button component={RouterLink} to="/cart" variant="text">
                                    Quay lại giỏ hàng
                                </Button>
                                <Button variant="contained" color="warning" type="submit">
                                    Đặt mua
                                </Button>
                            </CardActions>
                        </Card>
                    </form>
                </Grid>

                {/* Danh sách giỏ hàng */}
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
                                        {currencyFormat(cart.price)} / {cart.unit}
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
            </Grid>
        </Container>
    )

}

export default Payment