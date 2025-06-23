import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { projectFirestore } from '../../firebase/config';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';

const Main = () => {
  const [mainFeatures, setMainFeatures] = useState([]);

  useEffect(() => {
  
    const unsubscribeSesion = projectFirestore.collection('mainFeatures')
    .orderBy('order')
    .onSnapshot((snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMainFeatures(data);
    })

    return () => {
      unsubscribeSesion();
    }

  }, []);


  return (
    <Box sx={{ mt: 4 }}>
      <Hero />
      {mainFeatures.map(section => (
        <Features
          key={section.id}
          categoryId={section.categoryId}
          title={section.title}
          img={section.image}
        />
      ))}
    </Box>
  );
};

export default Main;
