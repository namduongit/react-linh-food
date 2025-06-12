import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    container: {
        marginBottom: '130px'
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
    },
    switchButton: {
    marginLeft: 8,
    padding: '4px 8px',
    border: 'none',
    backgroundColor: '#1976d2',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    '&:hover': {
        backgroundColor: '#1565c0',
    },
}

}));