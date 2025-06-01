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

const Cart = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [total, setTotal] = useState(0);
    const [note, setNote] = useState('');

    const [role, setRole] = useState([]);

    const renderTotal = useCallback(() => {
        const total = docs.reduce((n, { price, quantity }) => n + (parseInt(price) * quantity), 0);
        localStorage.setItem('total', total);
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

    const handleClear = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
            projectFirestore.collection('cart').doc(id).delete();
        }
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
        <Container className={classes.container}>
            <Typography variant='h4' style={{ textTransform: 'uppercase' }}>
                Giỏ hàng
            </Typography>
            <Grid container spacing={2} justifyContent="center">
                <Grid item md={8}>
                    {docs.map(cart => (
                        <Card
                            key={cart.id}
                            sx={{
                                display: 'flex',
                                margin: '20px 0',
                                position: 'relative',
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={cart.image}
                                style={{ width: 151 }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <CardContent>
                                        <Typography sx={{ width: "370px" }}>
                                            {cart.name}
                                        </Typography>
                                        <Typography>
                                            {currencyFormat(cart.price)}/{cart.unit}
                                        </Typography>
                                    </CardContent>
                                </Box>
                                <Box sx={{ ml: 2, mb: 1 }} className={classes.quantity}>
                                    <IconButton
                                        color="secondary"
                                        className={classes.quantityButton}
                                        onClick={() => decrease(cart.id, cart.quantity)}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                    <Typography className={classes.cartQuantity}>
                                        {cart.quantity}
                                    </Typography>
                                    <IconButton
                                        color="primary"
                                        className={classes.quantityButton}
                                        onClick={() => increase(cart.id, cart.quantity)}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                <IconButton style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => handleClear(cart.id)} >
                                    <DeleteForeverIcon style={{ fontSize: '30px' }} />
                                </IconButton>
                                <Typography style={{ position: 'absolute', bottom: 10, right: 20 }}>
                                    {currencyFormat(cart.price * cart.quantity)} đ
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </Grid>
                <Grid item md={4}>
                    <Card style={{ margin: '20px 0' }}>
                        <CardContent>
                            <Typography style={{ marginBottom: '10px' }}>
                                Ghi chú
                            </Typography>
                            <TextareaAutosize
                                minRows={5}
                                placeholder="Ghi chú cho đơn hàng của bạn"
                                style={{ width: '100%', resize: 'none', marginBottom: '20px', padding: '20px 10px' }}
                                value={note}
                                onChange={handleNote}
                            />
                            <hr />
                            <Typography style={{ margin: '10px 0', color: 'red' }}>
                                Tổng tiền: {currencyFormat(total)} đ
                            </Typography>
                            <hr />
                            <Typography>
                                Nhân Viên DVKH sẽ xác nhận lại đơn hàng của Bạn trước khi giao hàng.
                            </Typography>
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="warning"
                                style={{ marginBottom: '10px' }}
                            >
                                {role === 'user' &&
                                    <MaterialLink
                                        underline="none"
                                        color="inherit"
                                        component={RouterLink} to={'/payment'}
                                        className={classes.links}
                                    >
                                        Tiến hành đặt hàng
                                    </MaterialLink>
                                }
                                {role === 'staff' &&
                                    <MaterialLink
                                        underline="none"
                                        color="inherit"
                                        component={RouterLink} to={'/staff/payment'}
                                        className={classes.links}
                                    >
                                        Tiến hành đặt hàng
                                    </MaterialLink>
                                }
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Cart