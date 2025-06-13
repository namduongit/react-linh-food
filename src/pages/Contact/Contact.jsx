import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    Container,
    Link,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';


// Import image
import ShopeFood from '../../assets/contact/shopee-food_cfc2fd661ad8433f86b82f80fca34368.png';
import Tiki from '../../assets/contact/logo_tiki-31_881b1de0fcdc40f0a1cd459869de6136.png';
import GrabMart from '../../assets/contact/z3119419235383_cb20d569c0b62534814b91fece6b5790_6200c656bc294e71bebba4bf7b207d2f.png';

const contactData = [
    {
        id: 1,
        title: 'Cơ sở 1',
        address: 'Số 2 ngõ 84 phố Trần Thái Tông, Cầu Giấy, Hà Nội',
        hotline: '0902147886 - 0936253588',
    },
    {
        id: 3,
        title: 'Cơ sở 3',
        address: 'Số 794 đường Láng - Quận Đống Đa - Hà Nội',
        hotline: '0898080794 - 0977910986',
    },
    {
        id: 6,
        title: 'Cơ sở 2',
        address:
            'Phong Lan 01-01, Khu Đô Thị Vinhomes Riverside The Harmony, Quận Long Biên (mặt đường Nguyễn Lam - cạnh cổng an ninh 34)',
        hotline: '0906263616 - 0363283898',
    },
];

const partners = [
    { name: 'ShopeeFood', logo: ShopeFood },
    { name: 'Tiki', logo: Tiki },
    { name: 'GrabMart', logo: GrabMart },
];


const Contact = () => {
    return (
        <Container>
            <Box sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    THÔNG TIN LIÊN HỆ
                </Typography>

                <Grid container spacing={3}>
                    {contactData.map((item) => (
                        <Grid item xs={12} md={6} lg={4} key={item.id} sx={{ display: 'flex' }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    flex: 1,
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>
                                        {item.title}
                                    </Typography>

                                    <Box display="flex" alignItems="flex-start" mb={1}>
                                        <RoomIcon color="primary" sx={{ mt: '2px', mr: 1 }} />
                                        <Typography variant="body2">{item.address}</Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" mb={1}>
                                        <PhoneIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="body2">{item.hotline}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>


                <Divider sx={{ my: 4 }} />
                <Box sx={{ py: 6, backgroundColor: '#fff', padding: '20px 0' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Đối tác của Linh Food
                        </Typography>

                        <Grid container spacing={3} justifyContent="left" alignItems="center">
                            {partners.map((partner, index) => (
                                <Grid item key={index}>
                                    <Box
                                        component="img"
                                        src={partner.logo}
                                        alt={partner.name}
                                        sx={{
                                            height: 50,
                                            objectFit: 'contain',
                                            mx: 2,
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                </Box>
                <Divider sx={{ my: 4 }} />
                <Box mt={4} sx={{ marginTop: "20px" }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight="500">Sản phẩm thuộc về Ninh Đức Linh</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <PhoneIcon sx={{ mr: 1 }} color="action" />
                        <Typography variant="body2">036.497.9922</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1 }} color="action" />
                        <Link href="mailto:ninhduclinh98@gmail.com" underline="hover">
                            ninhduclinh98@gmail.com
                        </Link>
                    </Box>
                </Box>

            </Box>
        </Container>
    );
};

export default Contact;
