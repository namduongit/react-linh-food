import { useState, useEffect, useCallback } from 'react'
import { useStyles } from './styles';
import { Card, CardActions, CardContent, Link as MaterialLink, CardMedia, Container, Grid, IconButton, Button, Typography, Box, TextareaAutosize, useRadioGroup } from '@mui/material';
import { projectFirestore, projectAuth } from '../../firebase/config';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Link as RouterLink } from 'react-router-dom';
import { currencyFormat } from '../../utils/currencyFormat';
import { useAuthState } from "react-firebase-hooks/auth";
import { showNotification } from '../../services/showNotification';
import { toast } from '../../services/toast';

const Cart = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [total, setTotal] = useState(0);
    const [note, setNote] = useState('');

    const [role, setRole] = useState([]);

    const renderTotal = useCallback(() => {
        const total = docs.reduce((n, { price, quantity }) => n + (parseInt(price) * quantity), 0);
        setTotal(total);
    }, [docs])

    const handleNote = (event) => {
        setNote(event.target.value);
        localStorage.setItem('note', event.target.value);
    }

    const increase = (id, quantity) => {
        projectFirestore.collection('cart').doc(id).update({
            quantity: quantity + 1
        });
    }

    const decrease = (id, quantity) => {
        if (quantity > 1) {
            projectFirestore.collection('cart').doc(id).update({
                quantity: quantity - 1
            });
        }
    }

    const handleClear = async (id) => {
        const confirm = await showNotification('Bạn có chắc chắn xóa sản phẩm này ?');
        if (!confirm) return;
        projectFirestore.collection('menu').doc(id).delete();
        toast({
            title: 'Thông báo',
            message: `Xóa sản phẩm ${id} thành công`,
            type: 'success',
            duration: 3000
        });

    }

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
    }, [setDocs, user]);

    useEffect(() => {
        renderTotal()
    }, [renderTotal])

    useEffect(() => {
        if (user != null) {
            const userRef = projectFirestore.collection('users').where('uid', '==', user.uid);

            const getUser = async () => {
                try {
                    const querySnapshot = await userRef.get();

                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        setRole(doc.data().role);
                    } else {
                        console.log("Không tìm thấy user trong Firestore");
                        setRole(null);
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy user:", error);
                    setRole(null);
                }
            };

            getUser();
        } else {
            setRole(null);
        }
    }, [user]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>
                Giỏ hàng của bạn
            </Typography>

            <Grid container spacing={3}>
                {/* Danh sách món ăn trong giỏ */}
                <Grid item xs={12} md={8}>
                    {docs.length === 0 ? (
                        <Typography variant="body1">Chưa có món nào trong giỏ hàng.</Typography>
                    ) : (
                        docs.map((cart) => (
                            <Card key={cart.id} sx={{ display: 'flex', mb: 3, boxShadow: 3 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 140 }}
                                    image={cart.image}
                                    alt={cart.name}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <CardContent sx={{ pb: 1 }}>
                                        <Typography variant="h6" noWrap>{cart.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {currencyFormat(cart.price)} / {cart.unit}
                                        </Typography>
                                    </CardContent>

                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                                        <IconButton onClick={() => decrease(cart.id, cart.quantity)} color="error">
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography sx={{ mx: 2 }}>{cart.quantity}</Typography>
                                        <IconButton onClick={() => increase(cart.id, cart.quantity)} color="primary">
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <IconButton color="error" onClick={() => handleClear(cart.id)}>
                                        <DeleteForeverIcon />
                                    </IconButton>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 'auto' }}>
                                        {currencyFormat(cart.price * cart.quantity)} đ
                                    </Typography>
                                </Box>
                            </Card>
                        ))
                    )}
                </Grid>

                {/* Thông tin ghi chú & tổng */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, boxShadow: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Ghi chú cho đơn hàng
                        </Typography>
                        <TextareaAutosize
                            minRows={4}
                            placeholder="Ví dụ: Giao sau 17h, không cay..."
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', borderColor: '#ccc' }}
                            value={note}
                            onChange={handleNote}
                        />

                        <Box mt={3} mb={2}>
                            <Typography variant="subtitle1" color="text.secondary">
                                Tổng tiền:
                            </Typography>
                            <Typography variant="h5" color="error" fontWeight="bold">
                                {currencyFormat(total)} đ
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Nhân viên DVKH sẽ liên hệ để xác nhận đơn hàng trước khi giao.
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            sx={{ fontWeight: 'bold', py: 1.5 }}
                            component={RouterLink}
                            to={role === 'staff' ? '/staff/payment' : '/payment'}
                            disabled={docs.length === 0}
                        >
                            Tiến hành đặt hàng
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Cart