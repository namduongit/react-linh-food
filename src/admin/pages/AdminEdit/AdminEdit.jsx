import { useState, useEffect } from 'react';
import {
  Container, FormControl, InputLabel, Typography, Box, TextField,
  Select, Button, MenuItem
} from '@mui/material';
import { projectFirestore } from '../../../firebase/config';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../../../services/toast';

function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState({});

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [availible, setAvailible] = useState(true);

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [docSnap, catSnap, typeSnap, unitSnap] = await Promise.all([
        projectFirestore.collection('menu').doc(id).get(),
        projectFirestore.collection('categories').get(),
        projectFirestore.collection('types').get(),
        projectFirestore.collection('units').get(),
      ]);

      const menuData = docSnap.data();
      setDoc(menuData);
      setName(menuData.name || '');
      setCategory(menuData.category || '');
      setSubtitle(menuData.subtitle || '');
      setDescription(menuData.description || '');
      setUnit(menuData.unit || '');
      setPrice(menuData.price || '');
      setType(menuData.type || '');
      setQuantity(menuData.quantity || 0);
      setAvailible(menuData.availible ?? true);

      const parse = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setCategories(parse(catSnap));
      setTypes(parse(typeSnap));
      setUnits(parse(unitSnap));
      setLoading(false);
    };

    loadData().catch((err) => {
      console.error('Lỗi tải dữ liệu:', err);
      toast({ title: 'Lỗi', message: 'Không thể tải dữ liệu', type: 'error' });
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await projectFirestore.collection('menu').doc(id).set({
      ...doc,
      name,
      category,
      subtitle,
      description,
      type,
      unit,
      price,
      availible,
      quantity
    });
    toast({
      title: 'Thông báo',
      message: 'Sửa sản phẩm thành công',
      type: 'success',
      duration: 3000
    });
    navigate('/admin/menu');
  };

  const filteredTypes = types.filter(t => t.categoryId === category);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chỉnh sửa món ăn
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Vui lòng chỉnh sửa thông tin bên dưới và nhấn "Lưu thay đổi"
          </Typography>
        </Box>

        {!loading ? (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Tên món ăn"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                label="Ghi chú"
                fullWidth
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />

              <FormControl fullWidth required>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setType('');
                  }}
                >
                  {categories.map(item => (
                    <MenuItem key={item.id} value={item.id}>{item.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {filteredTypes.length > 0 && (
                <FormControl fullWidth required>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {filteredTypes.map(item => (
                      <MenuItem key={item.id} value={item.id}>{item.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth required>
                <InputLabel>Đơn vị</InputLabel>
                <Select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {units.map(item => (
                    <MenuItem key={item.id} value={item.id}>{item.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Giá"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <TextField
                label="Số lượng còn lại"
                fullWidth
                type="number"
                value={quantity}
                disabled
              />

              <FormControl fullWidth required>
                <InputLabel>Hiển thị trên website</InputLabel>
                <Select
                  value={availible}
                  onChange={(e) => setAvailible(e.target.value === 'true')}
                >
                  <MenuItem value={'true'}>Bán hàng</MenuItem>
                  <MenuItem value={'false'}>Dừng bán</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="large"
                  disabled={loading}
                >
                  Lưu thay đổi
                </Button>
              </Box>
            </Box>
          </form>
        ) : (
          <Typography align="center" color="text.secondary">
            Đang tải dữ liệu sản phẩm...
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default AdminEdit;
