import { useEffect, useState } from 'react';
import {
  Container, Grid, Button, Pagination, Typography
} from '@mui/material';
import { projectFirestore } from '../../firebase/config';
import { useParams } from 'react-router-dom';
import Item from '../../components/Item/Item';
import { useStyles } from './styles';

const Menu = () => {
  const classes = useStyles();
  const [docs, setDocs] = useState([]);
  const [menu, setMenu] = useState([]);
  const [types, setTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { category } = useParams();

  const itemsPerPage = 8;
  const count = Math.ceil(menu.length / itemsPerPage);
  const begin = (currentPage - 1) * itemsPerPage;
  const end = begin + itemsPerPage;
  const result = menu.slice(begin, end);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleType = (event) => {
    const selectedTypeId = event.currentTarget.value;

    if (selectedTypeId === 'all') {
      setMenu(docs);
    } else {
      const filtered = docs.filter(item => {
        if (Array.isArray(item.type)) {
          return item.type.includes(selectedTypeId);
        }
        return item.type === selectedTypeId;
      });
      setMenu(filtered);
    }

    setCurrentPage(1);
  };

  useEffect(() => {
    const unsubscribe = projectFirestore
      .collection('menu')
      .where('category', '==', category)
      .where('availible', '==', true)
      .where('quantity', '>=', 1)
      .orderBy('quantity')
      .orderBy('price', 'asc')
      .onSnapshot(snapshot => {
        const fetchedDocs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setDocs(fetchedDocs);
      });

    return () => unsubscribe();
  }, [category]);

  useEffect(() => {
    const unsubscribe = projectFirestore
      .collection('types')
      .where('categoryId', '==', category)
      .onSnapshot(snapshot => {
        const fetchedTypes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTypes(fetchedTypes);
      });

    return () => unsubscribe();
  }, [category]);

  useEffect(() => {
    setMenu(docs);
    setCurrentPage(1);
  }, [docs]);


  const renderTypeButtons = () => (
    <>
      <Button
        className={classes.filter}
        sx={{ m: '0 20px 30px 0px' }}
        variant="outlined"
        onClick={handleType}
        value="all"
      >
        Tất cả
      </Button>
      {types.map(type => (
        <Button
          key={type.id}
          className={classes.filter}
          sx={{ m: '0 20px 30px' }}
          variant="outlined"
          onClick={handleType}
          value={type.id}
        >
          {type.value}
        </Button>
      ))}
    </>
  );

  return (
    <Container className={classes.container} sx={{ mb: '50px' }}>
      {category !== 'contact' && renderTypeButtons()}

      <Grid container spacing={3}>
        {result.length > 0 ? (
          result.map(doc => <Item key={doc.id} doc={doc} />)
        ) : (
          <Typography variant="h6" sx={{ p: 2 }}>
            Không có sản phẩm phù hợp.
          </Typography>
        )}
      </Grid>

      {count > 1 && (
        <Pagination
          count={count}
          page={currentPage}
          color="primary"
          className={classes.pagination}
          onChange={handlePageChange}
          sx={{ mt: 4 }}
        />
      )}
    </Container>
  );
};

export default Menu;
