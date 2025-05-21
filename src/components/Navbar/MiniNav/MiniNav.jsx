import React from 'react'
import { useStyles } from './styles';
import { AppBar, Menu, MenuItem, Button, Toolbar, Container, Box, Link as MaterialLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { items, navCategories, adminItems, staffItems } from '../../../constants';

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

    return (

        <AppBar
            elevation={0}
            className={classes.root}
            position="fixed"
            style={{ backgroundColor: '#2cbde5' }}
        >
            <Container>
                <Toolbar>
                    <Box className={classes.wrapper} sx={{ flexGrow: 1 }}>
                        {!(localStorage.getItem('role') === 'admin')
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
                                                >
                                                    {category.label}
                                                </MaterialLink>
                                            </MenuItem>

                                        ))
                                    }
                                </Menu>
                            </>
                        }

                        <>
                            {localStorage.getItem('role') === 'admin' &&
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
                            {localStorage.getItem('role') === 'staff' &&
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
                            {localStorage.getItem('role') === 'user' &&
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


        </AppBar>
    )
}

export default MiniNav