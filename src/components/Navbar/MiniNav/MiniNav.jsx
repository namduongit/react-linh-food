import React from 'react'
import { useStyles } from './styles';
import { AppBar, Menu, MenuItem, Button, Toolbar, Container, Box, Link as MaterialLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { items, navCategories, adminItems, staffItems } from '../../../constants';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { projectAuth, projectFirestore } from '../../../firebase/config';

import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import MinimizeIcon from '@mui/icons-material/Minimize';

const MiniNav = () => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [user] = useAuthState(projectAuth);
    const [role, setRole] = useState([]);

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

        <div
            elevation={0}
            className={classes.root}
            position="fixed"
            style={{ backgroundColor: '#2cbde5'}}
        >
            <Container sx={{ padding: 0 }}>
                <Toolbar>
                    <Box className={classes.wrapper} sx={{ flexGrow: 1 }}>
                        {!(role === 'admin')
                            &&
                            <>
                                <Button
                                    id="basic-button"
                                    aria-controls={open ? 'basic-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    onClick={handleClick}
                                    style={{ color: "white", backgroundColor: "#0073a0", padding: '20px' }}
                                >
                                    <ViewSidebarIcon sx={{ marginRight: 2 }} />
                                    Danh mục
                                </Button>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    {
                                        navCategories && navCategories.map((category) => (
                                            <MenuItem
                                                onClick={handleClose}
                                                className={classes.menuItem}
                                                key={category.value}
                                            >
                                                <MaterialLink
                                                    underline="none"
                                                    color="inherit"
                                                    component={RouterLink} to={`/menu/${category.value}`}
                                                    className={classes.links}
                                                    sx={{ padding: 0 }}
                                                >
                                                    <MinimizeIcon sx={{ marginRight: 2 }} />
                                                    {category.label}
                                                </MaterialLink>
                                            </MenuItem>

                                        ))
                                    }
                                </Menu>
                            </>
                        }

                        <>
                            {role === 'admin' &&
                                adminItems.map((item) => (
                                    <Box className={classes.navButton} key={item.value}>
                                        <Button
                                            startIcon={item.icon}
                                            style={{ color: "white", padding: '20px' }}
                                        >
                                            <MaterialLink
                                                underline="none"
                                                color="inherit"
                                                component={RouterLink} to={`/admin/${item.value}`}
                                            >
                                                {item.label}
                                            </MaterialLink>
                                        </Button>
                                    </Box>
                                ))}
                            {role === 'staff' &&
                                staffItems.map((item) => (
                                    <Box className={classes.navButton} key={item.value}>
                                        <Button
                                            startIcon={item.icon}
                                            style={{ color: "white", padding: '20px' }}
                                        >
                                            <MaterialLink
                                                underline="none"
                                                color="inherit"
                                                component={RouterLink} to={`/staff/${item.value}`}
                                            >
                                                {item.label}
                                            </MaterialLink>
                                        </Button>
                                    </Box>
                                ))
                            }
                            {role === 'user' &&
                                items.map((item) => (
                                    <Box className={classes.navButton} key={item.value}>
                                        <Button
                                            startIcon={item.icon}
                                            style={{ color: "white", padding: '20px' }}
                                        >
                                            <MaterialLink
                                                underline="none"
                                                color="inherit"
                                                component={RouterLink} to={`/user/${item.value}`}
                                            >
                                                {item.label}
                                            </MaterialLink>
                                        </Button>
                                    </Box>
                                ))
                            }
                        </>
                    </Box>
                </Toolbar>
            </Container>


        </div>
    )
}

export default MiniNav