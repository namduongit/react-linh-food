import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  wrapper: {
    padding: '24px 0',
  },
  rightTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  productCard: {
    cursor: 'pointer',
    transition: '0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    textAlign: 'center',
    height: '100%',
    padding: 0
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center'
  },
  image: {
    width: '40%',
    aspectRatio: 3/2,
    objectFit: 'cover',
    marginRight: 8
  },

  selectedItem: {
    
  }
}));
