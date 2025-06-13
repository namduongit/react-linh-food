import { useState, useEffect } from 'react'
import { Grid, Card, CardMedia, Link as MaterialLink, CardContent, CardActions, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom';
import { useStyles } from './styles';
import { projectFirestore, projectAuth } from '../../firebase/config';
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from 'firebase/compat/app';
import { currencyFormat } from '../../utils/currencyFormat';

import { toast } from '../../services/toast';

const Item = ({ doc }) => {
    const {
        name,
        id,
        price,
        subtitle,
        image,
        unit
    } = doc;
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [cart, setCart] = useState([]);

    const handleClick = () => {
        // Lấy sản phẩm khi ấn vào giỏ hàng
        const check = cart.find(item => (item.menuId === id));
        // Kiểm tra người dùng hiện tại
        if (user) {
            // Nếu sản phẩm đó tồn tại
            if (check) {
                // Cập nhật số lượng lên 1
                projectFirestore.collection('cart').doc(check.id).update({
                    quantity: firebase.firestore.FieldValue.increment(1)
                })
                // Người lại sản phẩm đó chưa có trong giỏ hàng thì tạo mới
            } else {
                projectFirestore.collection('cart').add({
                    uid: user.uid,
                    name,
                    menuId: id,
                    price,
                    subtitle,
                    image,
                    unit,
                    quantity: 1
                })
            }
            toast({
                title: 'Thông báo',
                message: 'Thêm sản phẩm vào giỏ thành công',
                type: 'success',
                duration: 3000
            });
        } else {
            const provider = new firebase.auth.GoogleAuthProvider();
            projectAuth.signInWithPopup(provider)
                .then(({ user }) => {
                    const check = docs.find(doc => doc.uid === user.uid);
                    if (!check) {
                        user.role = 'user';
                        projectFirestore.collection('users').add({
                            name: user.displayName,
                            uid: user.uid,
                            email: user.email,
                            role: user.role,
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
        }
    }

    useEffect(() => {
        projectFirestore.collection('users')
            .orderBy('name', 'desc')
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

        if (user) {
            projectFirestore.collection('cart')
                .orderBy('name', 'desc')
                .where('uid', '==', user.uid)
                .onSnapshot((snap) => {
                    let documents = [];
                    snap.forEach(doc => {
                        documents.push({
                            ...doc.data(),
                            id: doc.id
                        })
                    });
                    setCart(documents)
                })
        }

    }, [setDocs, setCart, user]);

    return (
        <Grid item xs={12} sm={6} md={3} key={id}>
            <Card
                className={classes.card}
                sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                    }
                }}
            >
                <MaterialLink
                    underline="none"
                    color="inherit"
                    component={RouterLink}
                    to={`/details/${id}`}
                >
                    <CardMedia
                        component="img"
                        image={image}
                        alt={name}
                        sx={{
                            height: 200,
                            objectFit: 'cover',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12
                        }}
                    />
                </MaterialLink>

                <CardContent>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                        className={classes.name}
                    >
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {currencyFormat(price)} đ / {unit}
                    </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleClick}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Thêm vào giỏ hàng
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );

}

export default Item