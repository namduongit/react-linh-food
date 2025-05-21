import { useStyles } from './styles';
import { Container, TextField, Typography, Button, Box } from '@mui/material';
import { useFormik } from 'formik';
import { validationReserve } from '../../utils/validate';
import { useNavigate } from 'react-router-dom';
import { projectFirestore } from '../../firebase/config';

import { toast } from '../../services/toast';

const Reserve = () => {
    const classes = useStyles();
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
                name: values.name,
                phone: values.phone,
                description: values.description,
                hours: values.hours,
                number: values.number,
                date: values.date,
                checked: false
            });
            toast({
                title: 'Thông báo',
                message: 'Đặt hàng thành công',
                type: 'success',
                duration: 3000
            });
            navigate('/');
        },
    });
    return (
        <Container className={classes.container}>
            <Typography variant='h3' style={{ paddingBottom: '10px' }}>
                Gửi thông tin đặt bàn
            </Typography>
            <Typography variant='subtitle1'>
                Chúng tôi sẽ tiếp nhận yêu cầu và liên hệ bạn trong thời gian ngắn nhất
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Box className={classes.input}></Box>
                <TextField
                    label="Họ và tên"
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    id="name"
                    name="name"
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
                <Box className={classes.input}></Box>
                <TextField
                    label="Số điện thoại"
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.phone}
                    id="phone"
                    name="phone"
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                />
                <Box className={classes.input}></Box>
                <TextField
                    label="Số người"
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.number}
                    id="number"
                    name="number"
                    error={formik.touched.number && Boolean(formik.errors.number)}
                    helperText={formik.touched.number && formik.errors.number}
                />
                <Box className={classes.input}></Box>
                <TextField
                    type='date'
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.date}
                    id="date"
                    name="date"
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                />
                <Box className={classes.input}></Box>
                <TextField
                    type='time'
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.hours}
                    id="hours"
                    name="hours"
                    error={formik.touched.hours && Boolean(formik.errors.hours)}
                    helperText={formik.touched.hours && formik.errors.hours}
                />
                <Box className={classes.input}></Box>
                <TextField
                    label="Mô tả"
                    fullWidth
                    multiline
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    id="description"
                    name="description"
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                />
                <Button
                    variant="contained"
                    color="warning"
                    type="submit"
                    style={{ float: 'right', margin: '30px 0' }}
                >
                    Đặt bàn
                </Button>
            </form>
        </Container>
    )
}

export default Reserve