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
        const check = cart.find(item => (item.menuId === id));
        if (user) {
            if (check) {
                projectFirestore.collection('cart').doc(check.id).update({
                    quantity: firebase.firestore.FieldValue.increment(1)
                })
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
                    if (check) {
                        localStorage.setItem('user', JSON.stringify(check));
                        if (check.role === 'admin') {
                            localStorage.setItem('role', 'admin'); //
                        } else if (check.role === 'staff') {
                            localStorage.setItem('role', 'staff');
                        } else {
                            localStorage.setItem('role', 'user');
                        }
                    } else {
                        user.role = 'user';
                        projectFirestore.collection('users').add({
                            name: user.displayName,
                            uid: user.uid,
                            email: user.email,
                            role: user.role,
                        })

                        localStorage.setItem('role', 'user');
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
        <Grid item xs={12} sm={3} key={id}>
            <Card className={classes.card}>
                <MaterialLink
                    underline="none"
                    color="inherit"
                    component={RouterLink} to={`/details/${id}`}
                >
                    <CardMedia
                        component="img"
                        image={image}
                        className={classes.img}
                        width="200"
                        height="200"
                    />
                </MaterialLink>
                <CardContent>
                    <Typography >
                        <span className={classes.name}>{name}</span>
                    </Typography>
                    <Typography variant="body2">
                        <span className={classes.price}>{currencyFormat(price)} đ/{unit}</span>
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleClick}
                    >
                        Thêm vào giỏ hàng
                    </Button>
                </CardActions>
            </Card>
        </Grid>

    )
}

export default Item