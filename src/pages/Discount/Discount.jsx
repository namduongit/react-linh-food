import { useEffect, useState } from 'react';
import {
  Container, Grid, Button, Pagination, Typography
} from '@mui/material';
import { projectFirestore } from '../../firebase/config';
import Item from '../../components/Item/Item';
import { useStyles } from './styles';

const DiscountedMenu = () => {
  const classes = useStyles();
  const [products, setProducts] = useState([]);

  const [filtered, setFiltered] = useState([]);

  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const count = Math.ceil(filtered.length / itemsPerPage);
  const begin = (currentPage - 1) * itemsPerPage;
  const result = filtered.slice(begin, begin + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleType = (event) => {
    const selectedCategoryId  = event.currentTarget.value;
    if (selectedCategoryId  === 'all') {
      setFiltered(products);
    } else {
      const filteredByType = products.filter(item => item.category == selectedCategoryId);
      setFiltered(filteredByType);
    }

    console.log(filtered)
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchDiscounted = async () => {
      const snap = await projectFirestore.collection('discounts')
        .get();

      const discountProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const categorySnap = await projectFirestore.collection('categories').get();
      const categoriesItem = categorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setProducts(discountProducts);
      setCategories(categoriesItem);
      setFiltered(discountProducts);
    };

    fetchDiscounted();
  }, []);


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
      {categories.map(type => (
        <Button
          key={type.id}
          className={classes.filter}
          sx={{ m: '0 10px 30px' }}
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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sản phẩm giảm giá
      </Typography>

      {renderTypeButtons()}

      <Grid container spacing={3}>
        {result.length > 0 ? (
          result.map(doc => <Item key={doc.id} doc={doc} discount={true} />)
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

export default DiscountedMenu;