import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: '50px'
    },
    select:{
        display: 'flex',   
    },
    info: {
        backgroundColor: '#ccc'
    },
    input: {
        margin: '10px 0'
    },
    total: {
        marginTop: '20px',
        display: 'flex',
        justifyContent:'flex-end',
        alignItems: 'center'
    }
}));