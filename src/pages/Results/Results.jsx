import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Container, Grid, Link as MaterialLink, Button, Pagination} from '@mui/material';
import { projectFirestore } from "../../firebase/config";
import { useParams } from 'react-router-dom';
import { sideTypes, seafoodTypes } from '../../constants';
import Item from '../../components/Item/Item';

const Results = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [menu, setMenu] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { keyword } = useParams();

    const itemsPerPage = 8;
    const count = Math.ceil(menu.length / itemsPerPage);
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    const result = menu.slice(begin, end);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    }

    useEffect(() => {
        projectFirestore.collection('menu')
            .where('name', "<=", keyword.charAt(0))
            .orderBy('name', 'asc')
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

export default Results