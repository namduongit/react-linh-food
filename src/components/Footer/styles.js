import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    logo: {
        fontSize: '35px',
    },
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
    },
    text : {
        fontSize: '22px',
        margin: '0 20px',
        fontWeight: 'bold'
    }
}));