import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { projectFirestore } from '../../firebase/config';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';

const Main = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('featuredTypes')
      .orderBy('order')
      .onSnapshot((snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSections(data);
      });
    return () => unsubscribe();
  }, []);

  return (
    <Box>
      <Hero />
      {sections.map(section => (
        <Features
          key={section.id}
          type={section.type}
          categoryId={section.categoryId}
          title={section.title}
          img={section.image}
        />
      ))}
    </Box>
  );
};

export default Main;
