import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, TextField, Button, Grid, Box, MenuItem
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Edit, Delete } from '@mui/icons-material';
import { projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';

const keyCollections = {
  categories: 'Danh mục',
  types: 'Loại',
  units: 'Đơn vị'
};

const AdminKey = () => {
  const [activeCollection, setActiveCollection] = useState('categories');
  const [keys, setKeys] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [newKey, setNewKey] = useState({ value: '', categoryId: '' });
  const [editKeyId, setEditKeyId] = useState(null);
  const [editValue, setEditValue] = useState({ value: '', categoryId: '' });
  const [filterCategory, setFilterCategory] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const unsubscribe = projectFirestore.collection(activeCollection)
      .orderBy('value')
      .onSnapshot((snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setKeys(data);
      });

    return () => unsubscribe();
  }, [activeCollection]);

  useEffect(() => {
    const unsubscribe = projectFirestore.collection('menu')
      .onSnapshot(snap => {
        setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeCollection !== 'types') return;
    const unsubscribe = projectFirestore.collection('categories')
      .orderBy('value')
      .onSnapshot((snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategoryList(data);
      });

    return () => unsubscribe();
  }, [activeCollection]);

  const isKeyInUse = (keyId) => {
    if (activeCollection === 'categories') {
      return menuItems.some(item => item.category === keyId);
    } else if (activeCollection === 'types') {
      return menuItems.some(item => item.type === keyId);
    } else if (activeCollection === 'units') {
      return menuItems.some(item => item.unit === keyId);
    }
    return false;
  };

  const handleAdd = async () => {
    if (!newKey.value.trim()) return;

    const confirm = await showNotification('Chắc chắn thêm thuộc tính này ?');
    if (!confirm) return;

    const dataToAdd = { value: newKey.value.trim() };
    if (activeCollection === 'types' && newKey.categoryId) {
      dataToAdd.categoryId = newKey.categoryId;
    }

    await projectFirestore.collection(activeCollection).add(dataToAdd);
    toast({ title: 'Thông báo', message: 'Thêm thành công', type: 'success' });
    setNewKey({ value: '', categoryId: '' });
  };

  const handleDelete = async (id) => {
    if (isKeyInUse(id)) {
      toast({ title: 'Không thể xóa', message: 'Khóa đang được sử dụng trong sản phẩm', type: 'error' });
      return;
    }

    const confirm = await showNotification('Bạn có chắc muốn xóa khóa này?');
    if (!confirm) return;

    await projectFirestore.collection(activeCollection).doc(id).delete();
    toast({ title: 'Thông báo', message: 'Xóa thuộc tính này thành công', type: 'success' });
  };

  const handleEdit = async (id) => {
    if (!editValue.value.trim()) return;

    const dataToUpdate = { value: editValue.value.trim() };
    if (activeCollection === 'types' && editValue.categoryId) {
      dataToUpdate.categoryId = editValue.categoryId;
    }

    await projectFirestore.collection(activeCollection).doc(id).update(dataToUpdate);
    setEditKeyId(null);
    toast({ title: 'Cập nhật thành công', type: 'success' });
  };

  const filteredKeys = keys.filter(k => {
    if (activeCollection !== 'types') return true;
    if (!filterCategory) return true;
    return k.categoryId === filterCategory;
  });

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Quản lý Khóa</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Object.entries(keyCollections).map(([key, label]) => (
          <Button
            key={key}
            variant={key === activeCollection ? 'contained' : 'outlined'}
            onClick={() => {
              setActiveCollection(key);
              setNewKey({ value: '', categoryId: '' });
              setEditKeyId(null);
              setFilterCategory('');
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Đang quản lý: <strong>{keyCollections[activeCollection]}</strong>
      </Typography>

      {activeCollection === 'types' && (
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            label="Lọc theo danh mục"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categoryList.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
          {activeCollection === 'types' && (
            <Grid item xs={5}>
              <TextField
                select
                label="Danh mục"
                fullWidth
                value={newKey.categoryId}
                onChange={(e) => setNewKey(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                {categoryList.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={activeCollection === 'types' ? 5 : 10}>
            <TextField
              label={`Tên ${keyCollections[activeCollection]}`}
              fullWidth
              value={newKey.value}
              onChange={(e) => setNewKey(prev => ({ ...prev, value: e.target.value }))}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={handleAdd} fullWidth>Thêm</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{keyCollections[activeCollection]}</TableCell>
              {activeCollection === 'types' && <TableCell>Danh mục</TableCell>}
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKeys.map(key => (
              <TableRow key={key.id}>
                <TableCell>
                  {editKeyId === key.id ? (
                    <TextField
                      value={editValue.value}
                      onChange={(e) => setEditValue(prev => ({ ...prev, value: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    key.value
                  )}
                </TableCell>

                {activeCollection === 'types' && (
                  <TableCell>
                    {editKeyId === key.id ? (
                      <TextField
                        select
                        value={editValue.categoryId}
                        onChange={(e) => setEditValue(prev => ({ ...prev, categoryId: e.target.value }))}
                        fullWidth
                      >
                        {categoryList.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.value}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      categoryList.find(c => c.id === key.categoryId)?.value || 'Không rõ'
                    )}
                  </TableCell>
                )}

                <TableCell align="right">
                  {editKeyId === key.id ? (
                    <Button onClick={() => handleEdit(key.id)}>Lưu</Button>
                  ) : (
                    <IconButton onClick={() => {
                      setEditKeyId(key.id);
                      setEditValue({ value: key.value, categoryId: key.categoryId || '' });
                    }}>
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton color="error" onClick={() => handleDelete(key.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={activeCollection === 'types' ? 3 : 2} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default AdminKey;
