import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Container, Typography, Grid } from '@mui/material';
import { projectFirestore } from "../../firebase/config";
import Item from '../../components/Item/Item';

const Features = ({ type, img }) => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    
    useEffect(() => {
        projectFirestore.collection('menu')
            .where('category', '==', 'seafood')
            .orderBy('price', 'asc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({
                        ...doc.data(),
                        id: doc.id
                    })
                });
                setDocs(documents)
            })
    }, [setDocs])

    return (
        <Container className={classes.container}>
            <img src={img} alt="branding" width="100%" />
            <Typography variant="h5" style={{ fontWeight: 'bold', margin: '20px 0', textTransform: 'upperCase' }}>
                Một số loại {type}
            </Typography>
            <Grid container spacing={3}>
                {
                    docs && docs.filter(doc => doc.type === type).slice(0, 4).map(doc => (
                        <Item key={doc.id} doc={doc}></Item>
                    ))
                }
            </Grid>
        </Container>
    )
}

export default Features