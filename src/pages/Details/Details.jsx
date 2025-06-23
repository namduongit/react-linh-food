import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Button, Container, Grid, Typography, Box } from '@mui/material';
import { projectFirestore, projectAuth } from "../../firebase/config";
import { useParams } from 'react-router-dom';
import { currencyFormat } from '../../utils/currencyFormat';
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from 'firebase/compat/app';
import { toast } from '../../services/toast';

const Details = () => {
  const classes = useStyles();
  const { id } = useParams();
  const [user] = useAuthState(projectAuth);
  const [cart, setCart] = useState([]);
  const [units, setUnits] = useState([]);
  const [doc, setDoc] = useState(null);
  const [isDiscount, setIsDiscount] = useState(false);

  const getUnitLabel = (unitKey) => {
    const found = units.find(u => u.id === unitKey);
    return found ? found.value : unitKey;
  };

  const handleClick = () => {
    if (!doc || !user) return;

    const check = cart.find(item => item.menuId === doc.id);

    if (check) {
      projectFirestore.collection('cart').doc(check.id).update({
        quantity: firebase.firestore.FieldValue.increment(1)
      });
    } else {
      const cartItem = {
        uid: user.uid,
        name: doc.name,
        menuId: doc.id,
        price: doc.price,
        subtitle: doc.subtitle,
        image: doc.image,
        unit: doc.unit,
        quantity: 1
      };

      if (isDiscount) {
        cartItem.discount = doc.discount;
        cartItem.isDiscount = true;
      }

      projectFirestore.collection('cart').add(cartItem);
    }

    toast({
      title: 'Thông báo',
      message: 'Thêm sản phẩm vào giỏ thành công',
      type: 'success',
      duration: 3000
    });
  };

  useEffect(() => {
    const fetchUnits = async () => {
      const snap = await projectFirestore.collection('units').get();
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnits(data);
    };
    fetchUnits();

    const fetchData = async () => {
      let snap = await projectFirestore.collection('discounts').doc(id).get();
      if (snap.exists) {
        setDoc({ id: snap.id, ...snap.data() });
        setIsDiscount(true);
      } else {
        snap = await projectFirestore.collection('menu').doc(id).get();
        if (snap.exists) {
          setDoc({ id: snap.id, ...snap.data() });
          setIsDiscount(false);
        }
      }
    };
    fetchData();

    let unsubCart = () => { };
    if (user) {
      unsubCart = projectFirestore.collection('cart')
        .where('uid', '==', user.uid)
        .onSnapshot((snap) => {
          const documents = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setCart(documents);
        });
    }

    return () => unsubCart();
  }, [id, user]);

  if (!doc) return null;

  const originalPrice = isDiscount
    ? Math.round(doc.price / (1 - doc.discount / 100))
    : doc.price;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6} alignItems="flex-start">
        <Grid item xs={12} md={5}>
          <Box
            component="img"
            src={doc.image}
            alt={doc.name}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 3,
              boxShadow: 3
            }}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {doc.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {doc.subtitle}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom fontWeight="bold">
            Số lượng còn lại {doc.quantity}
          </Typography>
          {isDiscount ? (
            <>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Giá gốc:&nbsp;
                <s style={{ color: '#999' }}>{currencyFormat(originalPrice)} đ</s>
              </Typography>
              <Typography variant="h5" color="error" fontWeight="bold" sx={{ mb: 1 }}>
                Còn: {currencyFormat(doc.price)} đ / {getUnitLabel(doc.unit)}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight="bold">
                -{doc.discount}% GIẢM GIÁ
              </Typography>
            </>
          ) : (
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
              Giá: <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                {currencyFormat(doc.price)} đ / {getUnitLabel(doc.unit)}
              </span>
            </Typography>
          )}

          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            * Do đặc tính sản phẩm nên trọng lượng thực tế có thể chênh lệch so với số lượng bạn đặt. Chúng tôi sẽ xác nhận lại với bạn sau.
          </Typography>

          <Typography variant="body1" fontWeight="bold" sx={{ mt: 3 }}>
            Mô tả sản phẩm
          </Typography>
          <Box sx={{ borderBottom: '1px solid #ddd', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {doc.description}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 2 }}
            onClick={handleClick}
          >
            Thêm vào giỏ hàng
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Details;
