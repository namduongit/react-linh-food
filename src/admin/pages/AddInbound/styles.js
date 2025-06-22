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
    aspectRatio: 3 / 2,
    objectFit: 'cover',
    marginRight: 8
  },

  selectedItem: {

  },
  productCard: {
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  image: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderBottom: '1px solid #eee'
  },

  cardContent: {
    padding: 8,
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }

}));
