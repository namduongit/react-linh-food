import { useEffect, useState } from 'react';
import { Container, Grid, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { projectFirestore } from '../../firebase/config';

const Hero = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = projectFirestore.collection('mainHeroes')
      .where('active', '==', true)
      .orderBy('order')
      .onSnapshot((snap) => {
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(docs);
      });

    return () => unsub();
  }, []);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <MuiLink
              underline="none"
              color="inherit"
              component={RouterLink}
              to={`/menu/${item.categoryId}`}
            >
              <img
                src={item.image}
                alt={item.title}
                width="100%"
                style={{
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </MuiLink>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Hero;
