import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
    tableHead: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
    },
    checkedRow: {
        backgroundColor: '#e8f5e9',
        '&:hover': {
            backgroundColor: '#d7f0dc',
        },
    },
    normalRow: {
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: '#f9f9f9',
        },
    },
    statusSelect: {
        minWidth: 180,
    },
    deleteIcon: {
        color: '#f44336',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
            transform: 'scale(1.2)',
        },
    },
    disabledDeleteIcon: {
        color: '#ccc',
        cursor: 'not-allowed',
        '&:hover': {
            transform: 'none',
        },
    },
    detailList: {
        paddingLeft: 16,
    },
}));
