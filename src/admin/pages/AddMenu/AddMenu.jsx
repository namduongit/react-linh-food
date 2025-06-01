import { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, Typography, Box, TextField, Select, Button, MenuItem, Input } from '@mui/material'
import { useStyles } from './styles';

import { projectFirestore } from '../../../firebase/config';
import { categories, units, seafoodTypes, sideTypes } from '../../../constants';

import { toast } from '../../../services/toast';

// Băm và lưu hình anh
import { projectStorage } from '../../../firebase/config';

function AddMenu() {
    // Nút chọn hình ảnh từ máy
    const [fileURL, setFileURL] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(true);

    const classes = useStyles();

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        const storageRef = projectStorage.ref(file.name);
        await storageRef.put(file);
        setFileURL(await storageRef.getDownloadURL());
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        projectFirestore.collection('menu').add({
            name,
            category,
            subtitle,
            description,
            type,
            unit,
            price,
            image: fileURL,
        });
        setName('');
        setCategory('');
        setSubtitle('');
        setDescription('');
        setPrice('');
        setUnit('');
        setType('');
        toast({
            title: 'Thông báo',
            message: 'Thêm sản phẩm thành công',
            type: 'success',
            duration: 3000
        });
    }

    useEffect(() => {
        setLoading(false);
    }, [setLoading])

    return (
        <Container className={classes.root}>
            <Typography variant="h4" className={classes.title}>
                Thêm sản phẩm
            </Typography>
            <Typography variant="h5" className={classes.subtitle}>
                Vui lòng điền đủ thông tin sản phẩm
            </Typography>
            <Box className={classes.form}>
                <InputLabel>Chọn ảnh</InputLabel>
                <Input
                    className={classes.input}
                    type="file" // type là file => upload file từ máy lên
                    fullWidth
                    onChange={handleUpload}
                />
                <TextField
                    label="Tên sản phẩm"
                    fullWidth
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <Box className={classes.input}></Box>
                <TextField
                    multiline
                    label="Mô tả sản phẩm"
                    fullWidth
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
                <Box className={classes.input}></Box>
                <TextField
                    multiline
                    label="Ghi chú"
                    fullWidth
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value)}
                />
                <FormControl fullWidth>
                    <InputLabel className={classes.input}>Danh mục</InputLabel>
                    <Select
                        className={classes.input}
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        {categories.map((category) => (
                            <MenuItem
                                key={category.value}
                                value={category.value}
                            >
                                {category.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                {category === 'seafood' &&
                    <FormControl fullWidth>
                        <InputLabel className={classes.input}>Loại</InputLabel>
                        <Select
                            className={classes.input}
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                        >
                            {seafoodTypes.map((type) => (
                                <MenuItem
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                }

                {category === 'side' &&
                    <FormControl fullWidth>
                        <InputLabel className={classes.input}>Loại</InputLabel>
                        <Select
                            className={classes.input}
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                        >
                            {sideTypes.map((type) => (
                                <MenuItem
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                }
                <FormControl fullWidth>
                    <InputLabel className={classes.input}>Đơn vị</InputLabel>
                    <Select
                        className={classes.input}
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                    >
                        {units.map((unit) => (
                            <MenuItem
                                key={unit.value}
                                value={unit.value}
                            >
                                {unit.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <Input
                        type="number"
                        fullWidth
                        placeholder="Price"
                        className={classes.input}
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                    />
                </FormControl>
                <Button
                    className={classes.btn}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    Add
                </Button>
            </Box>


        </Container>
    )
}

export default AddMenu
