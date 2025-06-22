import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useStyles } from './styles';
import { projectAuth, projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { Delete } from '@mui/icons-material';
import { updateDoc, addDoc, doc, collection, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../../services/showNotification';

const AddInbound = () => {
  const classes = useStyles();
  const [supplier, setSupplier] = useState('');
  const [supplierInfo, setSupplierInfo] = useState({ name: '', phone: '', address: '' });
  const [suppliers, setSuppliers] = useState([]);
  const [user] = useAuthState(projectAuth);
  const [date] = useState(new Date().toLocaleString());
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const [menuSnap, categorySnap, supplierSnap] = await Promise.all([
        projectFirestore.collection('menu').get(),
        projectFirestore.collection('categories').get(),
        projectFirestore.collection('suppliers').get()
      ]);

      const menuData = menuSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMenuItems(menuData);

      const catMap = {};
      const cats = categorySnap.docs.map(doc => {
        const data = doc.data();
        catMap[doc.id] = data.value;
        return { id: doc.id, value: data.value };
      });
      setCategoryMap(catMap);
      setCategories(cats);

      const supplierList = supplierSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(supplierList);
    };

    loadData();
  }, []);

  useEffect(() => {
    const found = suppliers.find(s => s.id === supplier);
    setSupplierInfo(found || { name: '', phone: '', address: '' });
  }, [supplier, suppliers]);

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
        message: 'Vui lòng chọn nhà cung cấp và chọn sản phẩm.',
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
      });
      return;
    }

    const confirm = await showNotification('Chắc chắn thêm phiếu nhập ?');
    if (!confirm) return;

    const docRef = await addDoc(collection(projectFirestore, 'inbound'), {
      uid: user.uid,
      name: user.displayName,
      supplier,
      date,
      total: 0,
      status: 'Chưa xác nhận'
    });

    toast({ title: 'Thành công', message: 'Tạo phiếu nhập thành công', type: 'success', duration: 3000 });

    const inboundId = docRef.id;
    let total = 0;
    await Promise.all(selectedItems.map(async item => {
      total += item.quantity * item.price;
      await addDoc(collection(projectFirestore, 'detail'), {
        inboundId,
        menuId: item.id,
        quantity: item.quantity,
        price: item.price,
        menuName: item.name
      });
    }));

    await updateDoc(doc(projectFirestore, 'inbound', inboundId), { total });

    toast({ title: 'Thành công', message: 'Cập nhật phiếu nhập thành công', type: 'success', duration: 3000 });
    navigate('/admin/inbound');
  };

  const filteredMenu = filterCategory
    ? menuItems.filter((item) => item.category === filterCategory)
    : menuItems;

  return (
    <Container maxWidth="xl">
      <Box className={classes.wrapper}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Thông tin phiếu nhập</Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Nhà cung cấp</InputLabel>
                  <Select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    label="Nhà cung cấp"
                  >
                    {suppliers.map(sup => (
                      <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Số điện thoại"
                  fullWidth margin="normal"
                  value={supplierInfo.phone || ''}
                  disabled
                />
                <TextField
                  label="Địa chỉ"
                  fullWidth margin="normal"
                  value={supplierInfo.address || ''}
                  disabled
                />
                <TextField
                  label="Mã tài khoản"
                  fullWidth margin="normal"
                  value={user?.uid || ''}
                  disabled
                />
                <TextField
                  label="Ngày nhập"
                  fullWidth margin="normal"
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
                      <Grid item xs={6} sm={3}>
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
                      <Grid item xs={6} sm={3}>
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
                label="Lọc theo danh mục"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
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
                    <CardContent className={classes.cardContent} sx={{ p: 0 }}>
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
