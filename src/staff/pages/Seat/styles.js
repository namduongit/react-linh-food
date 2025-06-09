import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center',
        marginTop: '60px'
    },
    title:{
        margin: '20px 0',
    },
    button: {
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 30px',
        margin: '30px',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        cursor: 'pointer'
    },
    buttonRed: {
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
        padding: '10px 30px',
        margin: '30px',
        cursor: 'pointer'
    },
    form: {
        width: '200px',
        margin: '0 auto'
    },
    clearIcon: {
        position: 'absolute',
        right: 10
    }
}));