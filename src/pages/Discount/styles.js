import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: '30px',
  },
  filter: {
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: '20px',
    minWidth: '100px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
  },
}));
