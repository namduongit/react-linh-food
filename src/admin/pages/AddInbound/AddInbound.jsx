import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
  Container,
  MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useStyles } from './styles';
import { projectAuth, projectFirestore, projectStorage } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { Delete } from '@mui/icons-material';

import { updateDoc, addDoc, doc, collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../../services/showNotification';


const AddInbound = () => {
  const classes = useStyles();
  const [supplier, setSupplier] = useState('');
  const [user] = useAuthState(projectAuth);
  const [date] = useState(new Date().toLocaleString());
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();



  // Lấy danh sách sản phẩm và loại
  useEffect(() => {
    const unsubscribe = projectFirestore.collection('menu').onSnapshot((snap) => {
      const data = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setMenuItems(data);
      const uniqueCategories = [...new Set(data.map((item) => item.category || ''))];
      setCategories(uniqueCategories);
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = (item) => {
    if (selectedItems.some((s) => s.id === item.id)) return;
    setSelectedItems([...selectedItems, { ...item, quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const handleChangeItem = (id, field, value) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleSubmit = async () => {
    if (!supplier || selectedItems.length === 0) {
      toast({
        title: 'Thông báo',
        message: 'Vui lòng nhập nhà cung cấp và chọn sản phẩm.',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    const check = selectedItems.find(item => (item.quantity < 1 || item.price < 1));
    if (check) {
      toast({
          title: 'Thông báo',
          message: 'Vui lòng nhập giá và số lượng lớn hơn 0',
          type: 'warning',
          duration: 3000
        })
        return;
    }


    const confirm = await showNotification('Chắc chắn thêm phiếu nhập ?');
    if (!confirm) return;

    // Tạo phiếu nhập
    const docRef = await addDoc(collection(projectFirestore, 'inbound'), {
      uid: user.uid,
      supplier: supplier,
      date: date,
      total: 0,
      status: 'Chưa xác nhận'
    });

    toast({
      title: 'Thông báo',
      message: 'Tạo phiếu nhập thành công',
      type: 'success',
      duration: 3000
    });

    const inboundId = docRef.id;
    // Cập nhật hóa đơn
    var total = 0;
    selectedItems.forEach(async item => {
      total += item.quantity * item.price;
      await addDoc(collection(projectFirestore, 'detail'), {
        inboundId: inboundId,
        menuId: item.id,
        quantity: item.quantity,
        price: item.price,
        menuName: item.name
      });
    })
    // Cập nhâtj thông tin phiếu nhập
    updateDoc(doc(projectFirestore, 'inbound', inboundId), {
      total: total
    });

    toast({
      title: 'Thông báo',
      message: 'Cập nhật phiếu nhập thành công',
      type: 'success',
      duration: 3000
    });
    navigate('/admin/inbound')
  };

  const filteredMenu = filterCategory
    ? menuItems.filter((item) => item.category === filterCategory)
    : menuItems;



  return (
    <Container maxWidth="xl">
      <Box className={classes.wrapper}>
        <Grid container spacing={3}>
          {/* Bên trái */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Thông tin phiếu nhập</Typography>

                <TextField
                  label="Tên nhà cung cấp"
                  fullWidth
                  margin="normal"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
                <TextField
                  label="Mã tài khoản"
                  fullWidth
                  margin="normal"
                  value={user.uid}
                  disabled
                />
                <TextField
                  label="Ngày nhập"
                  fullWidth
                  margin="normal"
                  value={date}
                  disabled
                />

                <Box mt={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tổng tiền: {totalAmount.toLocaleString()} VNĐ
                  </Typography>
                </Box>

                <Box mt={2} textAlign="right">
                  <Button variant="contained" onClick={handleSubmit}>Lưu phiếu nhập</Button>
                </Box>
              </CardContent>
            </Card>

            <Box mt={3}>
              <Typography variant="h6">Sản phẩm đã chọn</Typography>
              {selectedItems.map((item) => (
                <Card key={item.id} sx={{ mt: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography fontWeight="bold">{item.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          type="number"
                          label="Số lượng"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          type="number"
                          label="Giá nhập"
                          fullWidth
                          value={item.price}
                          onChange={(e) =>
                            handleChangeItem(item.id, 'price', parseInt(e.target.value) || 0)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box className={classes.rightTop}>
              <Typography variant="h6">Chọn sản phẩm</Typography>
              <TextField
                select
                size="small"
                label="Lọc theo loại"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Grid container spacing={2}>
              {filteredMenu.map((item) => (
                <Grid item xs={6} md={4} key={item.id}>
                  <Card
                    className={classes.productCard}
                    onClick={() => handleAddItem(item)}
                  >
                    <CardContent className={classes.cardContent} style={{
                      padding: 0
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={classes.image}
                      />
                      <Typography>{item.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AddInbound;
