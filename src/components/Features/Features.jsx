import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';
import { projectFirestore } from '../../firebase/config';
import Item from '../Item/Item';

const Features = ({ categoryId, img, title }) => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {

    const unsubscribe = projectFirestore.collection('menu')
      .where('category', '==', categoryId)
      .where('availible', '==', true)
      .where('quantity', '>=', 1)
      .orderBy('quantity')
      .orderBy('price', 'asc')
      .onSnapshot((snap) => {
        const filtered = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocs(filtered);
      });

    return () => unsubscribe();
  }, [categoryId]);

  const handleNavigate = () => {
    navigate(`/menu/${categoryId}`);
  };

  return (
    <Container sx={{ mb: 4 }}>
      <Box
        component="img"
        src={img}
        alt={title}
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: 3,
          my: 2,
          objectFit: 'cover',
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Button onClick={handleNavigate} endIcon={<NavigateNextIcon />} variant="text">
          Xem thêm
        </Button>
      </Box>

      <Grid container spacing={3}>
        {docs.slice(0, 4).map(doc => (
          <Item key={doc.id} doc={doc} />
        ))}
      </Grid>
    </Container>
  );
};

export default Features;
