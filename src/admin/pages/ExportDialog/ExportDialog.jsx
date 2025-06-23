import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid
} from '@mui/material';
import { useState, useEffect } from 'react';
import { projectFirestore } from '../../../firebase/config';
import { toast } from '../../../services/toast';
import { increment } from 'firebase/firestore';

import { showNotification } from '../../../services/showNotification.js';

const ExportTicketDialog = ({ open, onClose }) => {
  const [type, setType] = useState('cancel');
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    menuId: '',
    quantity: '',
    reason: '',
    discount: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await projectFirestore.collection('menu').get();
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    const { menuId, quantity, reason, discount } = form;

    const confirm = await showNotification('Chắc chắn xác nhận xuất hàng ?');
    if (!confirm) return;


    if (!menuId || !quantity || !reason || Number(quantity) <= 0 || (type === 'discount' && discount <= 0)) {
      return toast({ title: 'Thông báo', message: 'Thiếu hoặc sai thông tin', type: 'error' });
    }

    const selectedProduct = products.find(p => p.id === menuId);
    if (!selectedProduct) {
      return toast({ title: 'Thông báo', message: 'Không tìm thấy sản phẩm', type: 'error' });
    }

    const qty = Number(quantity);
    const originalPrice = selectedProduct.price;
    const finalPrice = type === 'discount'
      ? Math.round(originalPrice * (1 - discount / 100))
      : 0;

    try {
      if (type === 'discount') {
        const dataDiscount = selectedProduct;
        dataDiscount.price = finalPrice;
        dataDiscount.quantity = Number(quantity);
        dataDiscount.reason = reason;
        dataDiscount.discount = Number(discount);

        delete dataDiscount.id;
        await projectFirestore.collection('discounts').add(dataDiscount);
      }

      const exportData = {
        type,
        menuId,
        name: selectedProduct.name,
        quantity: qty,
        reason,
        createdAt: new Date(),
        ...(type === 'discount' && {
          discount: Number(discount),
          originalPrice,
          finalPrice
        })
      };

      await projectFirestore.collection('exports').add(exportData);

      await projectFirestore.collection('menu').doc(menuId).update({
        quantity: increment(-qty)
      });

      toast({ title: 'Thông báo', message: 'Tạo phiếu thành công', type: 'success' });
      onClose();
      setForm({ menuId: '', quantity: '', reason: '', discount: 0 });
      setType('cancel');
    } catch (err) {
      toast({ title: 'Lỗi', message: err.message, type: 'error' });
    }
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo phiếu xuất / hủy hàng</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Loại phiếu"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="cancel">Hủy hàng</MenuItem>
              <MenuItem value="discount">Bán giảm giá</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Chọn sản phẩm"
              value={form.menuId}
              onChange={(e) => setForm(p => ({ ...p, menuId: e.target.value }))}
            >
              {products.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.quantity} còn lại)
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Số lượng"
              value={form.quantity}
              onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
            />
          </Grid>

          {type === 'discount' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="% Giảm giá"
                value={form.discount}
                onChange={(e) => setForm(p => ({ ...p, discount: e.target.value }))}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Lý do"
              multiline
              rows={2}
              value={form.reason}
              onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>Tạo phiếu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportTicketDialog;
