import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    logo: {
        margin: '0 50px',
        width: '30%',
        height: 'auto'
    },
    navbar: {
        padding: '30px 0',
    },
    number: {
        fontSize: '30px',
        color: '#FEC519',
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    date: {
        fontSize: '12px',
        fontStyle: 'italic',
    },
    navItem: {
        margin: '0 30px'
    }
}));