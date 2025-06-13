import React from 'react'
import { useStyles } from './styles';
import { Container, Grid, Link as MaterialLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import seafoodHotpot from '../../assets/seafood-hotpot.jpg';
import appetizer from '../../assets/appetizer.jpg';
import promotion from '../../assets/promotion.jpg';
import sashimi from '../../assets/sashimi.jpg';

const Hero = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} className={classes.gridContainer}>
        {[
          { to: '/menu/hotpot', src: seafoodHotpot, alt: 'seafoodHotpot' },
          { to: '/menu/side', src: appetizer, alt: 'appetizer' },
          { to: '/menu/promotion', src: promotion, alt: 'promotion' },
          { to: '/menu/sashimi', src: sashimi, alt: 'sashimi' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <MaterialLink
              underline="none"
              color="inherit"
              component={RouterLink}
              to={item.to}
              className={classes.links}
            >
              <img
                src={item.src}
                alt={item.alt}
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
            </MaterialLink>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

}

export default Hero