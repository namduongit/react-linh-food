import { Container, TextField, Typography, Button, Box } from '@mui/material';
import { useFormik } from 'formik';
import { validationReserve } from '../../utils/validate';
import { useNavigate } from 'react-router-dom';
import { projectFirestore } from '../../firebase/config';
import { toast } from '../../services/toast';

const Reserve = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            description: '',
            date: '',
            hours: '',
            number: 1,
        },
        validationSchema: validationReserve,
        onSubmit: values => {
            projectFirestore.collection('reserve').add({
                ...values,
                checked: false
            });
            toast({
                title: 'Thông báo',
                message: 'Đặt bàn thành công!',
                type: 'success',
                duration: 3000
            });
            navigate('/');
        },
    });

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Box
                sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Gửi thông tin đặt bàn
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Chúng tôi sẽ tiếp nhận yêu cầu và liên hệ bạn trong thời gian ngắn nhất
                    </Typography>
                </Box>

                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Họ và tên"
                            fullWidth
                            id="name"
                            name="name"
                            onChange={formik.handleChange}
                            value={formik.values.name}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                        <TextField
                            label="Số điện thoại"
                            fullWidth
                            id="phone"
                            name="phone"
                            onChange={formik.handleChange}
                            value={formik.values.phone}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                        />
                        <TextField
                            label="Số người"
                            fullWidth
                            id="number"
                            name="number"
                            type="number"
                            onChange={formik.handleChange}
                            value={formik.values.number}
                            error={formik.touched.number && Boolean(formik.errors.number)}
                            helperText={formik.touched.number && formik.errors.number}
                            inputProps={{ min: 1 }}
                        />
                        <TextField
                            label="Ngày"
                            fullWidth
                            type="date"
                            id="date"
                            name="date"
                            onChange={formik.handleChange}
                            value={formik.values.date}
                            error={formik.touched.date && Boolean(formik.errors.date)}
                            helperText={formik.touched.date && formik.errors.date}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Giờ"
                            fullWidth
                            type="time"
                            id="hours"
                            name="hours"
                            onChange={formik.handleChange}
                            value={formik.values.hours}
                            error={formik.touched.hours && Boolean(formik.errors.hours)}
                            helperText={formik.touched.hours && formik.errors.hours}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Ghi chú"
                            fullWidth
                            multiline
                            rows={3}
                            id="description"
                            name="description"
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />

                        <Box sx={{ textAlign: 'right', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="warning"
                                type="submit"
                                size="large"
                                sx={{ px: 5 }}
                            >
                                Đặt bàn
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Container>
    );

};

export default Reserve;
