import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Container, Typography, Grid, Box } from '@mui/material';
import { projectFirestore } from "../../firebase/config";
import Item from '../../components/Item/Item';

import { Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useNavigate } from 'react-router-dom';

const Features = ({ type, img }) => {
    const navigate = useNavigate();

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

    const handleSlideMenu = () => {
        navigate('/menu/seafood');
    }

    return (
        <Container className={classes.container}>
            <Box
                component="img"
                src={img}
                alt={`banner-${type}`}
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: 3,
                    my: 2,
                    objectFit: 'cover',
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    mb: 1,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Một số loại {type}
                </Typography>
                <Button onClick={handleSlideMenu} endIcon={<NavigateNextIcon />} variant="text">
                    Xem thêm
                </Button>
            </Box>

            <Grid container spacing={3}>
                {docs
                    .filter(doc => doc.type === type)
                    .slice(0, 4)
                    .map(doc => (
                        <Item key={doc.id} doc={doc} />
                    ))}
            </Grid>
        </Container>
    );

}

export default Features