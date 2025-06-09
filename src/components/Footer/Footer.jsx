import { useStyles } from './styles';
import { AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import { LocalPizza, Phone } from '@mui/icons-material';
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
                <Grid container justifyContent="center" spacing={2}>
                    <Grid item sm={12} md={3} className={classes.wrapper}>
                        <img src={logo} alt="logo" width="50%" />
                    </Grid>
                    <Grid item sm={12} md={6} >
                        <Typography variant="body2" style={{ paddingTop: '20px' }}>
                            HỆ THỐNG HẢI SẢN BIỂN ĐÔNG
                        </Typography>
                        <Typography variant="body2">
                            ĐT : 0936253588 - 0902147886
                        </Typography>
                        <Typography variant="body2">
                            Cơ sở 1: Số 2 ngõ 84 phố Trần Thái Tông, Cầu Giấy, Hà Nội
                        </Typography>
                        <Typography variant="body2">
                            Cơ sở 2: Số 794 đường Láng - Quận Đống Đa - Hà Nội
                        </Typography>
                        <Typography variant="body2">
                            Cơ sở 3: Phong Lan 01-01, Khu Đô Thị Vinhomes Riverside The Harmony, Quận Long Biên ( mặt đường Nguyễn Lam - cạnh cổng an ninh 34 )
                        </Typography>
                        <Typography variant="body2" style={{ paddingBottom: '20px' }}>
                            Cơ sở 4: Số 67 Ngô Thì Nhậm, quận Hai Bà Trưng, Hà Nội (đúng góc ngã tư Hoà Mã - Ngô Thì Nhậm)
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
