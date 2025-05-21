import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: '130px',
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        textAlign: 'center',
        justifyContent: 'space-between',
    },
    navButton: {
        "&:hover": {
            backgroundColor: '#129fd8'
        },
    },
    menuItem:{
        color: 'black'
    },
    links: {
        padding: '20px',
        [theme.breakpoints.down('sm')]: {
            margin: '0 8px',
        },
        [theme.breakpoints.up('md')]: {
            margin: '0 25px',
        },
        fontWeight: 'bold',
        fontSize: '15px',
        cursor: 'pointer'
    }
}));