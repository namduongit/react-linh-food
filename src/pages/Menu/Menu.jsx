import { useEffect, useState } from 'react';
import { useStyles } from './styles';
import {
    Container,
    Grid,
    Button,
    Pagination,
    Typography
} from '@mui/material';
import { projectFirestore } from '../../firebase/config';
import { useParams } from 'react-router-dom';
import { sideTypes, seafoodTypes } from '../../constants';
import Item from '../../components/Item/Item';

const Menu = () => {
    const classes = useStyles();
    const [docs, setDocs] = useState([]);
    const [menu, setMenu] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { category } = useParams();

    const itemsPerPage = 8;
    const count = Math.ceil(menu.length / itemsPerPage);
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    const result = menu.slice(begin, end);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleType = (event) => {
        const value = event.currentTarget.value;

        if (value === 'Tất cả') {
            setMenu(docs);
        } else {
            const filtered = docs.filter(item =>
                Array.isArray(item.type)
                    ? item.type.includes(value)
                    : item.type === value
            );
            setMenu(filtered);
        }

        setCurrentPage(1); // Reset lại trang khi lọc
    };

    // Load dữ liệu từ Firestore
    useEffect(() => {
        const unsubscribe = projectFirestore
            .collection('menu')
            .where('category', '==', category)
            .orderBy('price', 'asc')
            .onSnapshot(snapshot => {
                const fetchedDocs = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }));
                setDocs(fetchedDocs);
            });

        return () => unsubscribe();
    }, [category]);

    // Cập nhật menu ban đầu mỗi khi docs thay đổi
    useEffect(() => {
        setMenu(docs);
        setCurrentPage(1);
    }, [docs]);

    // Hiển thị các nút lọc theo loại món
    const renderTypeButtons = () => {
        const types = category === 'side' ? sideTypes : seafoodTypes;

        return (
            <>
                <Button
                    className={classes.filter}
                    style={{ margin: '0 20px 30px' }}
                    variant="outlined"
                    onClick={handleType}
                    value="Tất cả"
                >
                    Tất cả
                </Button>
                {types.map(type => (
                    <Button
                        key={type.value}
                        className={classes.filter}
                        style={{ margin: '0 20px 30px' }}
                        variant="outlined"
                        onClick={handleType}
                        value={type.value}
                    >
                        {type.label}
                    </Button>
                ))}
            </>
        );
    };

    return (
        <Container className={classes.container} sx={{marginBottom: '50px'}}>
            {category !== 'contact' && renderTypeButtons()}

            {/* Danh sách sản phẩm */}
            <Grid container spacing={3}>
                {result.length > 0 ? (
                    result.map(doc => (
                        <Item key={doc.id} doc={doc} />
                    ))
                ) : (
                    <Typography variant="h6" style={{ padding: '20px' }}>
                        Không có sản phẩm phù hợp.
                    </Typography>
                )}
            </Grid>

            {/* Phân trang */}
            {count > 1 && (
                <Pagination
                    count={count}
                    page={currentPage}
                    color="primary"
                    className={classes.pagination}
                    onChange={handlePageChange}
                />
            )}
        </Container>
    );
};

export default Menu;
