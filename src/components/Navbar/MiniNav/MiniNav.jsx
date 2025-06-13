import React, { useState, useEffect } from 'react';
import {
    AppBar, Menu, MenuItem, Button, Toolbar, Container, Box, Link as MaterialLink
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { items, navCategories, adminItems, staffItems } from '../../../constants';

import { useAuthState } from 'react-firebase-hooks/auth';
import { projectAuth, projectFirestore } from '../../../firebase/config';

import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { useStyles } from './styles';

const MiniNav = () => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [user] = useAuthState(projectAuth);
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (user) {
            projectFirestore.collection('users')
                .where('uid', '==', user.uid)
                .onSnapshot((snap) => {
                    snap.forEach(doc => setRole(doc.data().role));
                });
        } else {
            setRole(null);
        }
    }, [user]);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const renderNavItems = (itemsList, basePath) =>
        itemsList.map((item) => (
            <Box className={classes.navButton} key={item.value}>
                <Button
                    startIcon={item.icon}
                    sx={{ color: 'white', padding: '12px 16px' }}
                >
                    <MaterialLink
                        underline="none"
                        color="inherit"
                        component={RouterLink}
                        to={`/${basePath}/${item.value}`}
                    >
                        {item.label}
                    </MaterialLink>
                </Button>
            </Box>
        ));

    return (
        <div
            className={classes.root}
            style={{
                backgroundColor: '#2cbde5',
            }}
        >
            <Container>
                <Toolbar disableGutters>
                    <Box className={classes.wrapper} sx={{ flexGrow: 1 }}>
                        {/* User: Danh mục sidebar */}
                        {role !== 'admin' && (
                            <>
                                <Button
                                    id="basic-button"
                                    aria-controls={open ? 'basic-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    onClick={handleClick}
                                    sx={{
                                        color: 'white',
                                        backgroundColor: '#0073a0',
                                        padding: '12px 16px',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: '#005f86',
                                        }
                                    }}
                                >
                                    <ViewSidebarIcon sx={{ mr: 1 }} />
                                    Danh mục
                                </Button>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                                >
                                    {navCategories.map((category) => (
                                        <MenuItem
                                            onClick={handleClose}
                                            key={category.value}
                                            className={classes.menuItem}
                                        >
                                            <MaterialLink
                                                underline="none"
                                                color="inherit"
                                                component={RouterLink}
                                                to={`/menu/${category.value}`}
                                                className={classes.links}
                                                sx={{ display: 'flex', alignItems: 'center' }}
                                            >
                                                <MinimizeIcon sx={{ mr: 1 }} />
                                                {category.label}
                                            </MaterialLink>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}

                        {/* Theo vai trò hiện nav phù hợp */}
                        {role === 'admin' && renderNavItems(adminItems, 'admin')}
                        {role === 'staff' && renderNavItems(staffItems, 'staff')}
                        {role === 'user' && renderNavItems(items, 'user')}
                    </Box>
                </Toolbar>
            </Container>
        </div>
    );
};

export default MiniNav;
