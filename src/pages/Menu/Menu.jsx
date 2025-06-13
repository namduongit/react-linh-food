import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Container, Grid, Link as MaterialLink, Button, Pagination } from '@mui/material';
import { projectFirestore } from "../../firebase/config";
import { useParams } from 'react-router-dom';
import { sideTypes, seafoodTypes } from '../../constants';
import Item from '../../components/Item/Item';

const Menu = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [menu, setMenu] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { category } = useParams();

    const itemsPerPage = 8;
    const count = Math.ceil(menu.length / itemsPerPage);
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    const result = menu.slice(begin, end);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    }

    const handleType = (event) => {
        if (event.currentTarget.value === 'Tất cả') {
            setMenu(docs);
            setCurrentPage(1);
        } else {
            const filterDocs = docs.filter(item => item.type.includes(event.currentTarget.value));
            setMenu(filterDocs);
            setCurrentPage(1);
        }
    }

    useEffect(() => {
        projectFirestore.collection('menu')
            .where('category', '==', category)
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
    }, [setDocs, category])

    useEffect(() => {
        setMenu(docs);
    })

    return (
        <Container className={classes.container}>
            {
                category != 'contact' && (
                    <Button
                        className={classes.filter}
                        style={{ margin: '0px 20px 30px' }}
                        variant="outlined"
                        onClick={handleType}
                    >
                        Tất cả
                    </Button>
                )
            }
            {
                category === 'side' && sideTypes.map(type => (
                    <Button
                        key={type.value}
                        className={classes.filter}
                        style={{ margin: '0px 20px 30px' }}
                        variant="outlined"
                        onClick={handleType}
                        value={type.value}
                    >
                        {type.label}
                    </Button>
                ))
            }
            {
                category === 'seafood' && seafoodTypes.map(type => (
                    <Button
                        key={type.value}
                        className={classes.filter}
                        style={{ margin: '0px 20px 30px' }}
                        variant="outlined"
                        onClick={handleType}
                        value={type.value}
                    >
                        {type.label}
                    </Button>
                ))
            }
            <Grid container spacing={3}>
                {
                    menu && result.map(doc => (
                        <Item key={doc.id} doc={doc}></Item>
                    ))
                }
            </Grid>
            <Pagination
                count={count}
                page={currentPage}
                color="primary"
                className={classes.pagination}
                onChange={handlePageChange}
            />
        </Container>
    )
}

export default Menu