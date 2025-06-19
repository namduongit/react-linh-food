import { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, Typography, Box, TextField, Select, Button, MenuItem, Input, Grid } from '@mui/material'
import { useStyles } from './styles';
import { projectFirestore } from '../../../firebase/config';
import { categories, units, seafoodTypes, sideTypes } from '../../../constants';
import { useParams, useNavigate } from 'react-router-dom';

import { toast } from '../../../services/toast';

function AdminEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [type, setType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [availible, setAvailible] = useState('');
    const [doc, setDoc] = useState([]);
    const [loading, setLoading] = useState(true);
    const classes = useStyles();

    const [statusArray] = ['Bán hàng', 'Ẩn đi'];


    const handleSubmit = (event) => {
        event.preventDefault();
        projectFirestore.collection('menu').doc(id).set({
            ...doc,
            name,
            category,
            subtitle,
            description,
            type,
            unit,
            price,
            availible
        });
        setName('');
        setCategory('');
        setSubtitle('');
        setDescription('');
        setPrice('');
        setUnit('');
        setType('');
        setAvailible('');
        toast({
            title: 'Thông báo',
            message: 'Sửa sản phẩm thành công',
            type: 'success',
            duration: 3000
        });
        navigate('/admin/menu');
    }

    useEffect(() => {
        projectFirestore.collection('menu').doc(id).get()
            .then((doc) => {
                setLoading(false);
                setDoc(doc.data());
                setName(doc.data().name);
                setCategory(doc.data().category);
                setDescription(doc.data().description);
                setSubtitle(doc.data().subtitle);
                setPrice(doc.data().price);
                setUnit(doc.data().unit);
                setType(doc.data().type);
                setQuantity(doc.data().quantity);
                setAvailible(doc.data().availible);
            })
            .catch((err) => {
                console.error(err);
            })
    }, [setDoc, setName, setCategory, setDescription, setSubtitle, setPrice, setUnit, setType, setQuantity, setAvailible])

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

                {!loading && (
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
                                    label="Danh mục"
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {category === 'seafood' && (
                                <FormControl fullWidth required>
                                    <InputLabel>Loại hải sản</InputLabel>
                                    <Select
                                        value={type}
                                        label="Loại"
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        {seafoodTypes.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {category === 'side' && (
                                <FormControl fullWidth required>
                                    <InputLabel>Loại món phụ</InputLabel>
                                    <Select
                                        value={type}
                                        label="Loại"
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        {sideTypes.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth required>
                                <InputLabel>Đơn vị</InputLabel>
                                <Select
                                    value={unit}
                                    label="Đơn vị"
                                    onChange={(e) => setUnit(e.target.value)}
                                >
                                    {units.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.label}
                                        </MenuItem>
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
                                label="Số hàng còn lại"
                                fullWidth
                                type="number"
                                // inputProps={{ min: 0 }}
                                value={quantity}
                                // onChange={(e) => setPrice(e.target.value)}
                                disabled
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Hiển thị trên website</InputLabel>
                                <Select
                                    value={availible}
                                    label="Hiển thị"
                                    onChange={(e) => setAvailible(e.target.value)}
                                >
                                    <MenuItem key={true} value={true}>
                                            Bán hàng
                                    </MenuItem>
                                    <MenuItem key={false} value={false}>
                                            Dừng bán
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ textAlign: 'right', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    size="large"
                                    sx={{ px: 5 }}
                                    disabled={loading}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Box>
                        </Box>
                    </form>
                )}

                {loading && (
                    <Typography align="center" color="text.secondary">
                        Đang tải dữ liệu sản phẩm...
                    </Typography>
                )}
            </Box>
        </Container>
    );


}

export default AdminEdit
