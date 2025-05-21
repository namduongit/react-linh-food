import { Box } from "@mui/material";
import AddMenu from "../AddMenu/AddMenu";
import { useStyles } from './styles';
function AdminMain() {
    const classes = useStyles();
    return (
        <Box className={classes.container}>
            <AddMenu />
        </Box>
    )
}

export default AdminMain
