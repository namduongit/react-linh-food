import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: '200px'
    },
    quantity: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid black',
        width: '100px',
        borderRadius: '10px'
    }
}));