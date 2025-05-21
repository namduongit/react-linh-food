import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: '170px'
    },
    gridContainer: {
        margin: '20px 0'
    },
    links: {
        '&:hover': {
            cursor: 'pointer'
        }
    }
}));