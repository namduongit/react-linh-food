// styles.js
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  form: {
    padding: theme.spacing(2),
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    padding: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      backgroundColor: '#f5f5f5',
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  actions: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
}));
