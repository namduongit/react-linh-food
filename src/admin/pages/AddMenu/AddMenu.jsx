import { useState, useEffect } from 'react';
import {
    Container, TextField, Typography, Box, Select, MenuItem,
    Button, InputLabel, FormControl, Input
} from '@mui/material';
import { toast } from '../../../services/toast';
import { useNavigate } from 'react-router-dom';

import { projectFirestore, projectStorage } from '../../../firebase/config';
import { categories, units, seafoodTypes, sideTypes } from '../../../constants';

const AddMenu = () => {
    const [fileURL, setFileURL] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (event) => {
        const file = event.target.files[0];
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
            image: fileURL,
        });
        toast({ title: 'Thành công', message: 'Đã thêm món ăn!', type: 'success', duration: 3000 });
        navigate('/admin/menu');
    };

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
                        <FormControl fullWidth>
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
                        />

                        <TextField
                            label="Ghi chú"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Danh mục</InputLabel>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        {c.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {category === 'seafood' && (
                            <FormControl fullWidth>
                                <InputLabel>Loại hải sản</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    {seafoodTypes.map((t) => (
                                        <MenuItem key={t.value} value={t.value}>
                                            {t.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {category === 'side' && (
                            <FormControl fullWidth>
                                <InputLabel>Loại món thêm</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    {sideTypes.map((t) => (
                                        <MenuItem key={t.value} value={t.value}>
                                            {t.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth>
                            <InputLabel>Đơn vị</InputLabel>
                            <Select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                {units.map((u) => (
                                    <MenuItem key={u.value} value={u.value}>
                                        {u.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Giá"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            fullWidth
                            inputProps={{ min: 0 }}
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
