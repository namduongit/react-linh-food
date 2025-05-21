import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: '160px',
        marginBottom: '200px'
    },
    title: {
        margin: '40px 0',
        textAlign: 'center',
    },
    tableHeader: {
        fontWeight: 'bold',
        fontSize: '15px',
    },
    editIcon: {
        cursor: 'pointer'
    },
    clearIcon: {
        cursor: 'pointer'
    }
}));