import { useEffect, useState } from 'react';
import {
    Container, Typography, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Table, TableBody, TableCell,
    TableContainer, TableFooter, TableHead, TablePagination, TableRow,
    Box, Divider, Paper
} from '@mui/material';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';

import { toast } from '../../../services/toast.js';

const AdminProfit = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [category, setCategory] = useState('');
    const [menuData, setMenuData] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    const [orderData, setOrderData] = useState([]);
    const [dineInData, setDineInData] = useState([]);
    const [inboundData, setInboundData] = useState([]);
    const [detailData, setDetailData] = useState([]);

    const [profitData, setProfitData] = useState([]);
    const [totals, setTotals] = useState({ revenue: 0, cost: 0, profit: 0 });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [stock, setStock] = useState(0);

    useEffect(() => {
        const fetchMenu = async () => {
            const snap = await projectFirestore.collection('menu').get();
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenuData(data);
            setMenuItems([...new Set(data.map(d => d.category))]);
        };
        fetchMenu();
    }, []);

    useEffect(() => {
        const unsubOrder = projectFirestore.collection('order')
            .where('status', '==', 'Đã hoàn thành')
            .onSnapshot(snap => setOrderData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

        const unsubDine = projectFirestore.collection('dinein')
            .where('status', '==', 'Đã hoàn thành')
            .onSnapshot(snap => setDineInData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

        const unsubInbound = projectFirestore.collection('inbound')
            .where('status', '==', 'Đã hoàn thành')
            .onSnapshot(snap => setInboundData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

        const unsubDetail = projectFirestore.collection('detail')
            .onSnapshot(snap => setDetailData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

        return () => {
            unsubOrder(); unsubDine(); unsubInbound(); unsubDetail();
        };
    }, []);

    const parseDate = (str) => {
        const [time, date] = str?.split(' ') || [];
        return date ? new Date(`${date} ${time}`) : null;
    };

    const isInDateRange = (strDate) => {
        const date = parseDate(strDate);
        const start = new Date(fromDate);
        const end = new Date(toDate + 'T23:59:59');
        return date && date >= start && date <= end;
    };

    const handleAnalyze = () => {
        if (!fromDate || !toDate) {
            toast({
                title: 'Thông báo', message: 'Vui lòng chọn ngày phù hợp', type: 'warning', duration: 30000
            })
            return

        }

        const inboundInRange = inboundData.filter(doc => isInDateRange(doc.date));
        const inboundIds = inboundInRange.map(doc => doc.id);
        const relevantDetails = detailData.filter(d => inboundIds.includes(d.inboundId));

        const inboundMap = {};
        relevantDetails.forEach(({ menuId, quantity, price }) => {
            if (!inboundMap[menuId]) inboundMap[menuId] = [];
            inboundMap[menuId].push({ quantity: Number(quantity), price: Number(price) });
        });

        const allSales = [...orderData, ...dineInData].filter(doc => isInDateRange(doc.date));
        const allItems = allSales.flatMap(doc => doc.cart || []);
        const saleMap = {};
        allItems.forEach(({ menuId, quantity, price }) => {
            if (!saleMap[menuId]) saleMap[menuId] = { quantity: 0, totalRevenue: 0 };
            saleMap[menuId].quantity += Number(quantity);
            saleMap[menuId].totalRevenue += Number(price) * Number(quantity);
        });

        const result = [];
        let totalRevenue = 0;
        let totalCostAll = 0;

        let reduces = 0;
        menuData.forEach(menu => {
            if (category && menu.category !== category) return;

            const price = Number(menu.price || 0); 
            const inbounds = inboundMap[menu.id] || [];

            const totalImportedQty = inbounds.reduce((sum, i) => sum + i.quantity, 0);
            const totalImportedCost = inbounds.reduce((sum, i) => sum + i.quantity * i.price, 0); 

            const sales = saleMap[menu.id] || { quantity: 0, totalRevenue: 0 };
            const remainingQty = totalImportedQty - sales.quantity;


            const expectedRevenue = sales.quantity * price;

            const profit = expectedRevenue - totalImportedCost;

            totalRevenue += sales.totalRevenue;
            totalCostAll += totalImportedCost;

            if (totalImportedQty > 0 || sales.quantity > 0) {
                result.push({
                    name: menu.name,
                    price,
                    sold: sales.quantity,
                    imported: totalImportedQty,
                    remaining: remainingQty,
                    cost: totalImportedCost,
                    profit,
                });
            }
            reduces += menu.quantity;
        });

        setProfitData(result);
        setTotals({
            revenue: totalRevenue,
            cost: totalCostAll,
            profit: totalRevenue - totalCostAll
        });

        setStock(reduces);
    };

    return (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Thống kê lợi nhuận</Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                <TextField label="Từ ngày" type="date" InputLabelProps={{ shrink: true }}
                    value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <TextField label="Đến ngày" type="date" InputLabelProps={{ shrink: true }}
                    value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <FormControl>
                    <InputLabel>Loại sản phẩm</InputLabel>
                    <Select value={category} label="Loại sản phẩm"
                        onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {menuItems.map((cat, idx) => (
                            <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleAnalyze}>Thống kê</Button>
            </Box>

            <Box mb={2}>
                <Typography><strong>Tổng doanh thu:</strong> {currencyFormat(totals.revenue)} đ</Typography>
                <Typography><strong>Tổng giá vốn:</strong> {currencyFormat(totals.cost)} đ</Typography>
                <Typography><strong>Lợi nhuận:</strong> {currencyFormat(totals.profit)} đ</Typography>
                {totals.profit < 0 && (
                <Typography>Hiện tại đang lỗ bạn nên coi điều chỉnh lại để có lợi nhuận</Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography><strong>Số sản phẩm còn trong kho:</strong> {currencyFormat(stock)}</Typography>
                <Divider sx={{ my: 2 }} />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell>Giá bán</TableCell>
                            <TableCell>Đã bán</TableCell>
                            <TableCell>Tổng tiền nhập</TableCell>
                            <TableCell>Lợi nhuận</TableCell>
                            <TableCell>Số lượng nhập</TableCell>
                            <TableCell>Số lượng còn lại</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {profitData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{currencyFormat(row.price)} đ</TableCell>
                                <TableCell>{row.sold}</TableCell>
                                <TableCell>{currencyFormat(row.cost)} đ</TableCell>
                                <TableCell>{currencyFormat(row.profit)} đ</TableCell>
                                <TableCell>{row.imported}</TableCell>
                                <TableCell>{row.remaining}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={profitData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 20, 50]}
                                labelRowsPerPage="Số dòng / trang"
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminProfit;