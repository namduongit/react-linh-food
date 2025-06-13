import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    filter: {
        width: '130px',
        height: '60px',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        '@media (max-width: 960px)': {
            height: '420px',
        },
        '@media (max-width: 600px)': {
            height: '500px',
        },
        cursor: 'pointer'
    },
    img: {

        borderRadius: '12px 12px 0 0',
        objectFit: 'cover',
        transition: '0.3s linear',
        "&:hover": {
            transform: 'scale(1.1)'
        },
    },
    name: {
        fontWeight: 'bold',
        display: 'inline-block',
    },
}));