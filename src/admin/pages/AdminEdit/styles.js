import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
     root: {
        border: '2px solid black',
        textAlign: 'center',
    },
    title: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingTop: '30px'
    },
    subtitle: {
        fontSize: '13px',
        paddingBottom: '30px'
    },
    form: {
        width: '400px',
        margin: 'auto',
        paddingBottom: '30px'
    },
    input: {
        margin: '10px 0'
    },
    btn: {
        marginTop: '30px',
        padding: '10px 30px'
    }
}));