import { useStyles } from './styles';
import { Toolbar, Typography, Grid } from '@mui/material';
import logo from '../../assets/header_logo.png';
import noti from '../../assets/dathongbao.webp';

const Footer = () => {
  const classes = useStyles();

  return (
    <div
      style={{
        backgroundColor: '#e3e3e3',
        color: 'black',
        padding: '30px 0',
        borderTop: '1px solid #ccc',
      }}
    >
      <Toolbar className={classes.root}>
        <Grid container justifyContent="center" spacing={2}>
          {/* Cột trái: Logo */}
          <Grid item xs={12} md={3} className={classes.wrapper}>
            <img src={logo} alt="logo" style={{ width: '60%', maxWidth: '200px' }} />
          </Grid>

          {/* Cột giữa: Nội dung thông tin */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Đồ án tốt nghiệp - Trường Đại học Bách khoa Hà Nội
            </Typography>
            <Typography variant="body2" gutterBottom>
              Tên đề tài: Hệ thống quản lý cửa hàng hải sản
            </Typography>
            <Typography variant="body2" gutterBottom>
              Sinh viên thực hiện: Ninh Đức Linh
            </Typography>
            <Typography variant="body2" gutterBottom>
              Email: ninhduclinh98@gmail.com
            </Typography>
            <Typography variant="body2" style={{ paddingTop: 8 }}>
              © 2025 - Dự án học thuật, không sử dụng cho mục đích thương mại
            </Typography>
          </Grid>

          {/* Cột phải: Thông báo */}
          <Grid item xs={12} md={3} className={classes.wrapper}>
            <img src={noti} alt="noti" style={{ width: '60%', maxWidth: '200px' }} />
          </Grid>
        </Grid>
      </Toolbar>
    </div>
  );
};

export default Footer;
