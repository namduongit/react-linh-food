import {
  Box, Button, Card, CardContent, Grid, TextField,
  Typography, IconButton, Container, MenuItem, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { projectFirestore, projectStorage } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';
import { v4 as uuidv4 } from 'uuid';


const AdminMainPage = () => {
  const [tab, setTab] = useState('feature');
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({
    title: '',
    image: null,
    order: 0,
    categoryId: '',
  });

  const collection = tab === 'feature' ? 'mainFeatures' : 'mainHeroes';

  useEffect(() => {
    const unsub = projectFirestore.collection(collection)
      .orderBy('order')
      .onSnapshot(snap => {
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (tab === 'feature' && filterCategory) {
          data = data.filter(item => item.categoryId === filterCategory);
        }
        setItems(data);
      });
    return () => unsub();
  }, [tab, filterCategory]);

  useEffect(() => {
    projectFirestore.collection('categories')
      .get().then(snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(data);
      });
  }, []);

  const handleImageUpload = async (file) => {
    const fileRef = projectStorage.ref(`homepage/${uuidv4()}-${file.name}`);
    await fileRef.put(file);
    return await fileRef.getDownloadURL();
  };

  const handleSubmit = async () => {
    const { title, image, order, categoryId } = form;
    if (!image || !categoryId || (tab === 'feature' && !title)) {
      return toast({ title: 'Thông báo', message: 'Thiếu thông tin', type: 'warning' });
    }
    setUploading(true);
    try {
      const imageUrl = typeof image === 'string' ? image : await handleImageUpload(image);
      const data = tab === 'feature'
        ? { title, image: imageUrl, order: Number(order), categoryId }
        : { image: imageUrl, order: Number(order), categoryId };

      if (selectedId) {
        await projectFirestore.collection(collection).doc(selectedId).update(data);
        toast({ title: 'Thông báo', message: 'Cập nhật thành công', type: 'success' });
      } else {
        await projectFirestore.collection(collection).add(data);
        toast({ title: 'Thông báo', message: 'Thêm mới thành công', type: 'success' });
      }
      setDialogOpen(false);
      setSelectedId(null);
      setForm({ title: '', image: null, order: 0, categoryId: '' });
    } catch (err) {
      toast({ title: 'Lỗi', message: err.message, type: 'warning' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirm = await showNotification('Bạn có chắc muốn xóa phần này không?');
    if (!confirm) return;
    await projectFirestore.collection(collection).doc(selectedId).delete();
    toast({ title: 'Thông báo', message: 'Đã xóa thành công', type: 'success' });
    setSelectedId(null);
  };

  const handleEdit = () => {
    const item = items.find(i => i.id === selectedId);
    if (!item) return;
    setForm({ ...item });
    setDialogOpen(true);
  };

  return (
    <Container sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Quản lý Trang chủ</Typography>

      <Tabs value={tab} onChange={(e, val) => {
        setTab(val);
        setSelectedId(null);
        setForm({ title: '', image: null, order: 0, categoryId: '' });
      }}>
        <Tab value="feature" label="Một số loại nổi bật" />
        <Tab value="hero" label="Ảnh giới thiệu" />
      </Tabs>


      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {tab === 'feature' && (
          <TextField
            select
            size="small"
            label="Lọc danh mục"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
            ))}
          </TextField>
        )}

        <Button variant="contained" disabled={!selectedId} onClick={handleEdit}>Sửa</Button>
        <Button variant="contained" color="error" disabled={!selectedId} onClick={handleDelete}>Xóa</Button>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>Thêm mới</Button>
      </Box>

      <Grid container spacing={2} mt={2}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              onClick={() => setSelectedId(item.id)}
              sx={{
                border: selectedId === item.id ? '2px solid #1976d2' : '1px solid #ddd',
                cursor: 'pointer',
              }}
            >
              <CardContent>
                {tab === 'feature' && (
                  <Typography fontWeight="bold">{item.title}</Typography>
                )}
                <Typography fontSize={14}>Danh mục: {categories.find(c => c.id === item.categoryId)?.value || '---'}</Typography>
                <Typography fontSize={14}>Thứ tự: {item.order}</Typography>
                <Box mt={1}><img src={item.image} alt="preview" width="100%" style={{ borderRadius: 8 }} /></Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedId ? 'Cập nhật' : 'Thêm mới'} {tab === 'hero' ? 'Banner Hero' : 'Loại nổi bật'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {tab === 'feature' && (
              <Grid item xs={12}>
                <TextField fullWidth label="Tiêu đề" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField select fullWidth label="Danh mục" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Thứ tự hiển thị" type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" component="label">
                {form.image ? 'Đổi ảnh' : 'Tải ảnh'}
                <input hidden type="file" accept="image/*" onChange={(e) => setForm(p => ({ ...p, image: e.target.files[0] }))} />
              </Button>
              {form.image && typeof form.image !== 'object' && (
                <Box mt={2}><img src={form.image} alt="preview" width={120} style={{ borderRadius: 8 }} /></Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            {uploading ? <CircularProgress size={20} /> : (selectedId ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMainPage;
