import { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, Typography, Box, TextField, Select, Button, MenuItem, Input } from '@mui/material'
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
    const [doc, setDoc] = useState([]);
    const [loading, setLoading] = useState(true);
    const classes = useStyles();

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
            })
            .catch((err) => {
                console.error(err);
            })
    }, [setDoc, setName, setCategory, setDescription, setSubtitle, setPrice, setUnit])

    return (
        <Container className={classes.root}>
            <Typography variant="h4" className={classes.title}>
                Chỉnh sửa thông tin sản phẩm
            </Typography>
            <Typography variant="h5" className={classes.subtitle}>
                Vui lòng điền đủ thông tin sản phẩm
            </Typography>
            <Box className={classes.form}>
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
                    Edit
                </Button>
            </Box>


        </Container>
    )
}

export default AdminEdit
