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
import { projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { Delete } from '@mui/icons-material';

const AddInbound = () => {
  const classes = useStyles();
  const [supplier, setSupplier] = useState('');
  const [accountId] = useState('admin01');
  const [date] = useState(new Date().toLocaleDateString('vi-VN'));
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

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
        title: 'Lỗi',
        message: 'Vui lòng nhập nhà cung cấp và chọn sản phẩm.',
        type: 'error',
      });
      return;
    }

    const newInbound = {
      supplier,
      accountId,
      date,
      items: selectedItems,
      total: totalAmount,
      status: 'Chưa xác nhận',
      createdAt: new Date(),
    };

    await projectFirestore.collection('inbounds').add(newInbound);
    toast({
      title: 'Thành công',
      message: 'Thêm phiếu nhập thành công!',
      type: 'success',
    });
    setSupplier('');
    setSelectedItems([]);
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
                  value={accountId}
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
                <Grid item xs={4} md={2} key={item.id}>
                  <Card
                    className={classes.productCard}
                    onClick={() => handleAddItem(item)}
                  >
                    <CardContent>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={classes.image}
                      />
                      <Typography>{item.name}</Typography>
                      {/* <Typography variant="caption">{item.unit}</Typography> */}
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
