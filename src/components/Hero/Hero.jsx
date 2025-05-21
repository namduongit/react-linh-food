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
    <Container>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} sm={6}>
          <MaterialLink
            underline="none"
            color="inherit"
            component={RouterLink} to={'/menu/hotpot'}
            className={classes.links}
          >
            <img src={seafoodHotpot} width="100%" alt="seafoodHotpot" />
          </MaterialLink>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MaterialLink
            underline="none"
            color="inherit"
            component={RouterLink} to={`/menu/side`}
            className={classes.links}
          >
            <img src={appetizer} alt="appetizer" width="100%" />
          </MaterialLink>
        </Grid>
      </Grid>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} sm={6}>
          <MaterialLink
            underline="none"
            color="inherit"
            component={RouterLink} to={`/menu/promotion`}
            className={classes.links}
          >
            <img src={promotion} width="100%" alt="promotion" />
          </MaterialLink>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MaterialLink
            underline="none"
            color="inherit"
            component={RouterLink} to={'/menu/sashimi'}
            className={classes.links}
          >
            <img src={sashimi} alt="sashimi" width="100%" />
          </MaterialLink>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Hero