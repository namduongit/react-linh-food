import { useStyles } from './styles';
import { AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import { LocalPizza, Padding, Phone } from '@mui/icons-material';
import logo from '../../assets/header_logo.png';
import noti from '../../assets/dathongbao.webp';

const Footer = () => {
    const classes = useStyles();

    return (
        <div
            position="static"
            style={{
                top: 'auto',
                bottom: 0,
                backgroundColor: '#e3e3e3',
                color: 'black'
            }}
        >
            <Toolbar className={classes.root}>
                <Grid container justifyContent="center" spacing={2} paddingTop={2}>
                    <Grid item sm={12} md={3} className={classes.wrapper}>
                        <img src={logo} alt="logo" width="50%" />
                    </Grid>
                    <Grid item sm={12} md={6}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Đồ án tốt nghiệp - Trường Đại học Bách khoa Hà Nội
                        </Typography>
                        <Typography variant="body2">
                            Tên đề tài: Hệ thống quản lý cửa hàng hải sản
                        </Typography>
                        <Typography variant="body2">
                            Sinh viên thực hiện: Ninh Đức Linh
                        </Typography>
                        <Typography variant="body2">
                            Email: ninhduclinh98@gmail.com
                        </Typography>
                        <Typography variant="body2" style={{ paddingBottom: '20px' }}>
                            © 2025 - Dự án học thuật, không sử dụng cho mục đích thương mại
                        </Typography>

                    </Grid>
                    <Grid item sm={12} md={3} className={classes.wrapper}>
                        <img src={noti} alt="noti" width="50%" />
                    </Grid>
                </Grid>
            </Toolbar>
        </div>
    )
}

export default Footer
