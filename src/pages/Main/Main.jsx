import React from 'react'
import Hero from '../../components/Hero/Hero'
import { useStyles } from './styles';
import { Box } from '@mui/material';
import Features from '../../components/Features/Features';
import branding from '../../assets/branding.jpg';
import shrimp from '../../assets/shrimp.jpg';
import crab from '../../assets/crab.jpg';

const Main = () => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Hero />
      <Features type="cá" img={branding}/>
      <Features type="tôm" img={shrimp}/>
      <Features type="cua" img={crab}/>
    </Box>
  )
}

export default Main