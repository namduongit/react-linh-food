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
  Typography
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Add } from '@mui/icons-material';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { projectFirestore } from '../../../firebase/config';
import { useStyles } from './styles';
import { toast } from '../../../services/toast';
import { showNotification } from '../../../services/showNotification';

const AdminSupplier = () => {
  const classes = useStyles();
  const [suppliers, setSuppliers] = useState([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [selected, setSelected] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(projectFirestore, 'suppliers'), snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(data);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return toast({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên nhà cung cấp', type: 'warning' });
    const confirm = await showNotification('Thêm nhà cung cấp mới?');
    if (!confirm) return;
    await addDoc(collection(projectFirestore, 'suppliers'), { name, phone, address });
    toast({ title: 'Thành công', message: 'Đã thêm nhà cung cấp', type: 'success' });
    setName(''); setPhone(''); setAddress('');
  };

  const handleSelect = (sup) => {
    setSelected(selected?.id === sup.id ? null : sup);
  };

  const handleOpenEdit = () => {
    if (!selected) return toast({ title: 'Thông báo', message: 'Chưa chọn nhà cung cấp nào để sửa', type: 'warning' });
    setEditName(selected.name);
    setEditPhone(selected.phone);
    setEditAddress(selected.address);
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    const confirm = await showNotification('Lưu chỉnh sửa nhà cung cấp?');
    if (!confirm) return;
    await updateDoc(doc(projectFirestore, 'suppliers', selected.id), {
      name: editName,
      phone: editPhone,
      address: editAddress
    });
    toast({ title: 'Cập nhật', message: 'Sửa thành công', type: 'success' });
    setSelected(null);
    setOpenDialog(false);
  };

  const handleDelete = async () => {
    if (!selected) return toast({ title: 'Thông báo', message: 'Chưa chọn nhà cung cấp nào để xóa', type: 'warning' });
    const confirm = await showNotification('Xóa nhà cung cấp này?');
    if (!confirm) return;
    await deleteDoc(doc(projectFirestore, 'suppliers', selected.id));
    toast({ title: 'Đã xóa', message: 'Xóa thành công', type: 'success' });
    setSelected(null);
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý nhà cung cấp
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Thêm nhà cung cấp</Typography>
          <TextField fullWidth label="Tên" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
          <TextField fullWidth label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
          <TextField fullWidth label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd} fullWidth>
            Thêm
          </Button>

          <Box mt={3} display="flex" gap={2}>
            <Button variant="outlined" color="primary" fullWidth onClick={handleOpenEdit}>Sửa</Button>
            <Button variant="outlined" color="error" fullWidth onClick={handleDelete}>Xóa</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {suppliers.map(sup => (
              <Grid item xs={12} sm={6} md={4} key={sup.id}>
                <Card
                  className={classes.card}
                  sx={{
                    border: selected?.id === sup.id ? '2px solid #1976d2' : 'none',
                    backgroundColor: selected?.id === sup.id ? '#e3f2fd' : 'inherit',
                    transform: selected?.id === sup.id ? 'scale(1.03)' : 'none'
                  }}
                  onClick={() => handleSelect(sup)}
                >
                  <CardContent>
                    <Typography variant="h6">{sup.name}</Typography>
                    <Typography variant="body2">SĐT: {sup.phone}</Typography>
                    <Typography variant="body2">Địa chỉ: {sup.address}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Chỉnh sửa nhà cung cấp</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên" value={editName} onChange={(e) => setEditName(e.target.value)} margin="normal" />
          <TextField fullWidth label="SĐT" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} margin="normal" />
          <TextField fullWidth label="Địa chỉ" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSupplier;
