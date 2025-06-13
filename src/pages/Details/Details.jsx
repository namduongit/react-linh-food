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
  const [docs, setDocs] = useState([]);
  const { id } = useParams();
  const [user] = useAuthState(projectAuth);
  const [cart, setCart] = useState([]);
  const check = cart.find(item => (item.menuId === id));
  const doc = docs.find(item => (item.id === id))

  const handleClick = () => {
    const {
      name,
      id,
      price,
      subtitle,
      image,
      unit
    } = doc;
    if (user) {
      if (check) {
        projectFirestore.collection('cart').doc(check.id).update({
          quantity: firebase.firestore.FieldValue.increment(1)
        })
      } else {
        projectFirestore.collection('cart').add({
          uid: user.uid,
          name,
          menuId: id,
          price,
          subtitle,
          image,
          unit,
          quantity: 1
        })
      }
      toast({
        title: 'Thông báo',
        message: 'Thêm sản phẩm vào giỏ thành công',
        type: 'success',
        duration: 3000
      });
    } else {
      const provider = new firebase.auth.GoogleAuthProvider();
      projectAuth.signInWithPopup(provider)
        .then(({ user }) => {
          const check = docs.find(doc => doc.uid === user.uid);
          if (!check) {
            user.role = 'user';
            projectFirestore.collection('users').add({
              name: user.displayName,
              uid: user.uid,
              email: user.email,
              role: user.role,
            })
          }
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }
  useEffect(() => {
    projectFirestore.collection('menu')
      .where('__name__', '==', id)
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
    if (user) {
      projectFirestore.collection('cart')
        .orderBy('name', 'desc')
        .where('uid', '==', user.uid)
        .onSnapshot((snap) => {
          let documents = [];
          snap.forEach(doc => {
            documents.push({
              ...doc.data(),
              id: doc.id
            })
          });
          setCart(documents)
        })
    }

  }, [setDocs, setCart, id])


  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {docs.map(doc => (
        <Grid container spacing={6} key={doc.id} alignItems="flex-start">
          {/* Hình ảnh */}
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

          {/* Thông tin sản phẩm */}
          <Grid item xs={12} md={7}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {doc.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {doc.subtitle}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
              Giá: <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                {currencyFormat(doc.price)} đ/{doc.unit}
              </span>
            </Typography>

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
      ))}
    </Container>
  );

}

export default Details