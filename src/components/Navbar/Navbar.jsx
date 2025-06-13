import {
    AppBar, Avatar, Toolbar, Typography, Link as MaterialLink, Box, IconButton,
    Badge, Container
} from '@mui/material';
import logo from '../../assets/header_logo.png';
import deliveryImg from '../../assets/giaohang2h_6984c4a90861405ab3c35f77edb41578.webp';
import { useStyles } from './styles';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MiniNav from './MiniNav/MiniNav';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from 'firebase/compat/app';
import { projectAuth, projectFirestore } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { showNotification } from '../../services/showNotification';
import { toast } from '../../services/toast';

const Navbar = () => {
    const classes = useStyles();
    const [user] = useAuthState(projectAuth);
    const [docs, setDocs] = useState([]);
    const [userCart, setUserCart] = useState([]);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    const signInWithGoogle = () => {
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
            .catch(console.error);
    };

    const handleSignOut = async () => {
        const confirm = await showNotification('Bạn có chắc chắn đăng xuất không ?');
        if (!confirm) return;

        try {
            await projectAuth.signOut();
            toast({
                title: 'Thông báo',
                message: 'Đăng xuất thành công',
                type: 'success',
                duration: 3000
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Thông báo',
                message: 'Đăng xuất thất bại',
                type: 'warning',
                duration: 3000
            });
        }
    };

    useEffect(() => {
        projectFirestore.collection('users')
            .orderBy('name', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => documents.push({ ...doc.data(), id: doc.id }));
                setDocs(documents);
            });

        if (user) {
            projectFirestore.collection('cart')
                .where('uid', '==', user.uid)
                .onSnapshot((snap) => {
                    let documents = [];
                    snap.forEach(doc => documents.push({ ...doc.data(), id: doc.id }));
                    setUserCart(documents);
                });
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const userRef = projectFirestore.collection('users').where('uid', '==', user.uid);
            userRef.get().then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setRole(doc.data().role);
                } else {
                    setRole(null);
                }
            }).catch(err => {
                console.error("Lỗi khi lấy user:", err);
                setRole(null);
            });
        } else {
            setRole(null);
        }
    }, [user]);

    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 9999 }}>
            <div className={classes.navbar} style={{ backgroundColor: '#2e9ed5' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 1 }}>
                        {/* Logo */}
                        <MaterialLink
                            underline="none"
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <img
                                src={logo}
                                alt="logo"
                                width="150"
                                height="60"
                                className={classes.logo}
                            />
                        </MaterialLink>

                        {/* Hotline */}
                        <Box sx={{ flexGrow: 1 }} />
                        <Box className={classes.navItem} sx={{ textAlign: 'right', mr: 2 }}>
                            <Typography>
                                <span className={classes.number}>1900 1006</span>
                            </Typography>
                            <Typography>
                                <span className={classes.date} style={{ color: 'white' }}>(8h - 21h từ T2-Chủ Nhật)</span>
                            </Typography>
                        </Box>

                        {/* Image giao hàng */}
                        <Box sx={{ display: { xs: 'none', md: 'block' }, mr: 2 }}>
                            <img
                                src={deliveryImg}
                                alt="delivery"
                                width="230"
                                height="35"
                            />
                        </Box>

                        {/* Đăng nhập / Avatar */}
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={user ? handleSignOut : signInWithGoogle}
                            sx={{ ml: 1 }}
                        >
                            {user ? (
                                <Avatar alt="User avatar" src={user.photoURL} />
                            ) : (
                                <AccountCircle sx={{ fontSize: 35 }} />
                            )}
                        </IconButton>

                        {/* Giỏ hàng cho user & staff */}
                        {(role === 'user' || role === 'staff') && (
                            <IconButton
                                edge="end"
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                <Badge
                                    badgeContent={userCart.reduce((n, { quantity }) => n + quantity, 0)}
                                    color="error"
                                >
                                    <MaterialLink
                                        underline="none"
                                        color="inherit"
                                        component={RouterLink}
                                        to="/cart"
                                        className={classes.links}
                                    >
                                        <ShoppingCartRoundedIcon fontSize="large" />
                                    </MaterialLink>
                                </Badge>
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>

                {/* MiniNav bên dưới thanh chính */}
                <MiniNav />
            </div>
        </div>
    );
};

export default Navbar;
