import { AppBar, Avatar, Toolbar, Typography, Link as MaterialLink, Box, IconButton, Badge, Container, InputAdornment, TextField } from '@mui/material';
import logo from '../../assets/header_logo.png'
import deliveryImg from '../../assets/giaohang2h_6984c4a90861405ab3c35f77edb41578.webp'
import { useStyles } from './styles';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MiniNav from './MiniNav/MiniNav';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from 'firebase/compat/app'
import { projectAuth, projectFirestore } from '../../firebase/config';
import { useState, useEffect } from 'react';

import { showNotification } from '../../services/showNotification';
import { toast } from '../../services/toast';

const Navbar = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [userCart, setUserCart] = useState([]);
    const navigate = useNavigate();

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        projectAuth.signInWithPopup(provider)
            .then(({ user }) => {
                const check = docs.find(doc => doc.uid === user.uid);
                if (check) {
                    console.log(check)
                    localStorage.setItem('user', JSON.stringify(check));
                    if (check.role === 'admin') {
                        localStorage.setItem('role', 'admin');
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

    const handleSignOut = async () => {
        const confirm = await showNotification('Bạn có chắc chắn đăng xuất không ?');
        if (!confirm) {
            return;
        }
        projectAuth.signOut()
            .then(() => {
                localStorage.setItem('user', null);
                localStorage.setItem('role', 'guest');
            })
            .catch((error) => {
                console.log(error);
            });
        toast({
            title: 'Thông báo',
            message: 'Đăng xuất thành công',
            type: 'success',
            duration: 3000
        });
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
                .where('uid', '==', user.uid)
                .onSnapshot((snap) => {
                    let documents = [];
                    snap.forEach(doc => {
                        documents.push({
                            ...doc.data(),
                            id: doc.id
                        })
                    });
                    setUserCart(documents)
                })
        }
    }, [setUserCart, setDocs, user])

    return (
        <div>
            <AppBar
                elevation={0}
                className={classes.navbar}
                style={{ backgroundColor: '#2e9ed5' }}
                position="fixed"
            >
                <Container maxWidth="xl">
                    <Toolbar>
                        <MaterialLink
                            underline="none"
                            color="inherit"
                            component={RouterLink} to={'/'}
                            className={classes.links}
                        >
                            <img
                                src={logo}
                                alt="logo"
                                width="150"
                                height="60"
                                className={classes.logo}
                            />
                        </MaterialLink>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box className={classes.navItem}>
                            <Typography >
                                <span className={classes.number}>1900 1006</span>
                            </Typography>
                            <Typography>
                                <span className={classes.date}>(8h - 21h từ T2-Chủ Nhật)</span>
                            </Typography>
                        </Box>
                        <img
                            className={classes.navItem}
                            src={deliveryImg}
                            alt="deliveryImg"
                            width="230"
                            height="35"
                        />
                        {!user ?
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                className={classes.iconButtons}
                                color="inherit"
                                onClick={signInWithGoogle}
                            >
                                <AccountCircle style={{ fontSize: '35px' }} />
                            </IconButton>

                            :
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                className={classes.iconButtons}
                                color="inherit"
                                onClick={handleSignOut}
                            >
                                <Avatar
                                    alt="account avatar"
                                    src={user.photoURL}
                                />
                            </IconButton>

                        }

                        {(localStorage.getItem('role') === 'user' || localStorage.getItem('role') === 'staff') &&
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                color="inherit"
                                style={{ margin: '0 10px' }}
                            >
                                <Badge badgeContent={userCart.reduce((n, { quantity }) => n + quantity, 0)} color="error">
                                    <MaterialLink
                                        underline="none"
                                        color="inherit"
                                        component={RouterLink} to={'/cart'}
                                        className={classes.links}
                                    >
                                        <ShoppingCartRoundedIcon fontSize="large" />
                                    </MaterialLink>
                                </Badge>
                            </IconButton>
                        }
                    </Toolbar>
                </Container>
            </AppBar>
            <MiniNav />
        </div>
    )
}

export default Navbar