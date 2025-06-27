import {
  Container, TextField, Typography, Box, Select, MenuItem,
  Button, InputLabel, FormControl, Input
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from '../../../services/toast';
import { useNavigate } from 'react-router-dom';

import { projectFirestore, projectStorage } from '../../../firebase/config';

const AddMenu = () => {
  const [fileURL, setFileURL] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const loadKeys = async () => {
      const [catSnap, typeSnap, unitSnap] = await Promise.all([
        projectFirestore.collection('categories').get(),
        projectFirestore.collection('types').get(),
        projectFirestore.collection('units').get()
      ]);

      const parse = (snap) =>
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setCategories(parse(catSnap));
      setTypes(parse(typeSnap));
      setUnits(parse(unitSnap));
    };

    loadKeys();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const storageRef = projectStorage.ref(file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    setFileURL(url);
    toast({ title: 'Thành công', message: 'Tải ảnh lên thành công!', type: 'success', duration: 2000 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await projectFirestore.collection('menu').add({
      name,
      category,
      subtitle,
      description,
      type,
      unit,
      price,
      profitPercentage,
      image: fileURL,
      quantity: 0,
      availible: false
    });
    toast({ title: 'Thành công', message: 'Đã thêm món ăn!', type: 'success', duration: 3000 });
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
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Thêm món ăn mới
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Điền thông tin chi tiết bên dưới để thêm món ăn vào menu.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth required>
              <Input type="file" onChange={handleUpload} />
            </FormControl>

            <TextField
              label="Tên món ăn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />

            <TextField
              label="Ghi chú"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              fullWidth
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
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.value}
                  </MenuItem>
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
                  {filteredTypes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.value}
                    </MenuItem>
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
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Giá"
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(Number(e.target.value)))}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />

            <TextField
              label="Phần trăm lợi nhuận (%)"
              type="number"
              value={profitPercentage}
              onChange={(e) => setProfitPercentage(parseFloat(e.target.value))}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />

            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                size="large"
              >
                Thêm món
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default AddMenu;
