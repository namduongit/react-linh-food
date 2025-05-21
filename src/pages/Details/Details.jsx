import { useEffect, useState } from 'react'
import { useStyles } from './styles';
import { Button, Container, Grid, Typography } from '@mui/material';
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
          if (check) {
            localStorage.setItem('user', JSON.stringify(check));
            if (check.role === 'admin') {
              localStorage.setItem('role', 'admin'); //
            } else if (check.role === 'staff') {
              localStorage.setItem('role', 'staff');
            } else {
              localStorage.setItem('role', 'user');
            }
          } else {
            user.role = 'user';
            projectFirestore.collection('users').add({
              name: user.displayName,
              uid: user.uid,
              email: user.email,
              role: user.role,
            })

            localStorage.setItem('role', 'user');
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
    <Container className={classes.container}>
      {docs.map(doc => (
        <Grid container spacing={4} key={doc.id}>
          <Grid item sm={4} xs={12}>
            <img src={doc.image} alt="details" width="100%" />
          </Grid>
          <Grid item sm={8} xs={12}>
            <Typography variant='h5' style={{ margin: '10px 0', fontWeight: 'bold' }}>
              {doc.name}
            </Typography>
            <Typography variant='subtitle1' style={{ margin: '10px 0' }}>
              {doc.subtitle}
            </Typography>
            <Typography variant='body1'>
              Giá tiền: {currencyFormat(doc.price)} đ/{doc.unit}
            </Typography>
            <Typography variant='subtitle2' style={{ margin: '10px 0' }}>
              "Do đặc tính sản phẩm nên trọng lượng thực tế có thể chênh lệch so với số lượng bạn đặt hàng. Siêu thị hải sản Biển Đông sẽ xác nhận với bạn khi có sự thay đổi"
            </Typography>
            <Typography variant='body2' style={{ margin: '10px 0' }}>
              Mô tả sản phẩm
            </Typography>
            <hr />
            <Typography variant='body1' style={{ margin: '10px 0' }}>
              {doc.description}
            </Typography>
            <Button
              variant="contained"
              color="warning"
              style={{ marginTop: '10px' }}
              onClick={handleClick}
            >
              Thêm vào giỏ hàng
            </Button>
          </Grid>
        </Grid>
      ))}
    </Container>
  )
}

export default Details