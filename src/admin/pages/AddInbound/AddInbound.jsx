import {
  Box, Button, Card, CardContent, Container, Grid, IconButton,
  TextField, Typography, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useState, useEffect } from 'react';
import { projectAuth, projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { Delete } from '@mui/icons-material';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../../services/showNotification';

const AddInbound = () => {
  const [supplier, setSupplier] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierInfo, setSupplierInfo] = useState({ name: '', phone: '', address: '' });
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [user] = useAuthState(projectAuth);
  const [date] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [menuSnap, catSnap, supplierSnap] = await Promise.all([
        projectFirestore.collection('menu').get(),
        projectFirestore.collection('categories').get(),
        projectFirestore.collection('suppliers').get()
      ]);

      setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, value: doc.data().value })));
      setSuppliers(supplierSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const info = suppliers.find(s => s.id === supplier);
    setSupplierInfo(info || { name: '', phone: '', address: '' });
  }, [supplier, suppliers]);

  const handleAddItem = (item) => {
    if (selectedItems.some(i => i.id === item.id)) return;
    setSelectedItems([...selectedItems, {
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: 1,
      price: 0,
      salePrice: item.price
    }]);
  };

  const handleChangeItem = (id, field, value) => {
    setSelectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: parseInt(value) || 0 } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(items => items.filter(i => i.id !== id));
  };

  const totalAmount = selectedItems.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleSubmit = async () => {
    if (!supplier || selectedItems.length === 0) {
      toast({ title: 'Lỗi', message: 'Chọn nhà cung cấp và sản phẩm', type: 'warning', duration: 3000 });
      return;
    }

    if (selectedItems.some(i => i.quantity < 1 || i.price < 1)) {
      toast({ title: 'Lỗi', message: 'Giá và số lượng phải > 0', type: 'warning', duration: 3000 });
      return;
    }

    const confirm = await showNotification('Xác nhận lưu phiếu nhập?');
    if (!confirm) return;

    const docRef = await addDoc(collection(projectFirestore, 'inbound'), {
      uid: user.uid,
      name: user.displayName,
      supplier,
      supplierName: supplierInfo.name,
      supplierPhone: supplierInfo.phone,
      supplierAddress: supplierInfo.address,
      date,
      total: 0,
      status: 'Chưa xác nhận'
    });

    let total = 0;
    await Promise.all(selectedItems.map(async item => {
      const cost = item.quantity * item.price;
      total += cost;
      await addDoc(collection(projectFirestore, 'detail'), {
        inboundId: docRef.id,
        menuId: item.id,
        quantity: item.quantity,
        price: item.price,
        menuName: item.name
      });
    }));

    await updateDoc(doc(projectFirestore, 'inbound', docRef.id), { total });
    toast({ title: 'Thành công', message: 'Tạo phiếu nhập thành công', type: 'success', duration: 3000 });
    navigate('/admin/inbound');
  };

  const filteredMenu = filterCategory
    ? menuItems.filter(i => i.category === filterCategory)
    : menuItems;

  return (
    <Container maxWidth="xl" sx={{ marginBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Thông tin phiếu nhập</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Nhà cung cấp</InputLabel>
                <Select value={supplier} onChange={(e) => setSupplier(e.target.value)} label="Nhà cung cấp">
                  {suppliers.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="SĐT" value={supplierInfo.phone} fullWidth disabled margin="normal" />
              <TextField label="Địa chỉ" value={supplierInfo.address} fullWidth disabled margin="normal" />
              <TextField label="Người tạo" value={user?.displayName} fullWidth disabled margin="normal" />
              <TextField label="Ngày" value={date} fullWidth disabled margin="normal" />
              <Box mt={2}>
                <Typography fontWeight="bold">Tổng tiền: {totalAmount.toLocaleString()} VNĐ</Typography>
              </Box>
              <Box mt={2} textAlign="right">
                <Button variant="contained" onClick={handleSubmit}>Lưu phiếu nhập</Button>
              </Box>
            </CardContent>
          </Card>

          <Box mt={3}>
            <Typography variant="h6">Sản phẩm đã chọn</Typography>
            {selectedItems.map(item => (
              <Card key={item.id} sx={{ mt: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography fontWeight="bold">{item.name}</Typography>
                      <Typography variant="body2">Giá bán: {item.salePrice.toLocaleString()} VNĐ</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Số lượng"
                        type="number"
                        fullWidth
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(item.id, 'quantity', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Giá nhập"
                        type="number"
                        fullWidth
                        value={item.price}
                        onChange={(e) => handleChangeItem(item.id, 'price', e.target.value)}
                        error={item.price > item.salePrice}
                        helperText={
                          item.price > item.salePrice ? '⚠ Giá nhập cao hơn giá bán' : ''
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
          <Box mb={2}>
            <Typography variant="h6">Chọn sản phẩm</Typography>
            <TextField
              select
              label="Lọc theo danh mục"
              size="small"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ width: 200, mt: 1 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Grid container spacing={2}>
            {filteredMenu.map(item => (
              <Grid item xs={6} sm={3} key={item.id}>
                <Card onClick={() => handleAddItem(item)} sx={{ cursor: 'pointer', textAlign: 'center', height: '100%' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                  <CardContent>
                    <Typography fontWeight="500">{item.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddInbound;
