import {
    Container, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
    Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Box, Paper, Divider
} from '@mui/material';
import { useEffect, useState } from 'react';
import { projectFirestore } from '../../../firebase/config';
import { currencyFormat } from '../../../utils/currencyFormat';

import { useNavigate } from 'react-router-dom';
import { toast } from '../../../services/toast';


const SupplierImportStats = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');

    const [inbounds, setInbounds] = useState([]);
    const [details, setDetails] = useState([]);

    const [stats, setStats] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const supSnap = await projectFirestore.collection('suppliers').get();
            setSuppliers(supSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const inboundSnap = await projectFirestore.collection('inbound')
                .where('status', '==', 'Đã hoàn thành').get();
            const detailSnap = await projectFirestore.collection('detail').get();

            setInbounds(inboundSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setDetails(detailSnap.docs.map(doc => doc.data()));
        };
        fetchData();
    }, []);

    const parseDate = (str) => new Date(str);

    const isInRange = (dateStr) => {
        const d = parseDate(dateStr);
        const from = new Date(fromDate);
        const to = new Date(toDate + 'T23:59:59');
        return d >= from && d <= to;
    };

    const handleAnalyze = () => {
        if (!fromDate || !toDate) {
            toast({
                title: 'Thông báo', message: 'Vui lòng chọn ngày phù hợp', type: 'warning', duration: 30000
            })
            return;
        }

        const filteredInbounds = inbounds.filter(inb => isInRange(inb.date) && (!selectedSupplier || inb.supplier === selectedSupplier));

        const groupBySupplier = {};
        filteredInbounds.forEach(inb => {
            if (!groupBySupplier[inb.supplier]) groupBySupplier[inb.supplier] = { name: inb.supplierName, items: [], total: 0 };

            const thisDetails = details.filter(d => d.inboundId === inb.id);
            thisDetails.forEach(d => {
                const existing = groupBySupplier[inb.supplier].items.find(i => i.menuId === d.menuId);
                if (existing) {
                    existing.quantity += d.quantity;
                    existing.prices.push(d.price);
                } else {
                    groupBySupplier[inb.supplier].items.push({
                        menuId: d.menuId,
                        name: d.menuName,
                        quantity: d.quantity,
                        prices: [d.price],
                    });
                }
                groupBySupplier[inb.supplier].total += d.quantity * d.price;
            });
        });
        setStats(groupBySupplier);
    };

    const renderTable = (supplierId, data) => (
        <Box mb={4} key={supplierId}>
            <Typography variant="h6">Nhà cung cấp: {data.name}</Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên món</TableCell>
                            <TableCell>Số lượng nhập</TableCell>
                            <TableCell>Giá thấp nhất</TableCell>
                            <TableCell>Giá cao nhất</TableCell>
                            <TableCell>Giá trung bình</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.items.map((item, idx) => {
                            const min = Math.min(...item.prices);
                            const max = Math.max(...item.prices);
                            const avg = item.prices.reduce((a, b) => a + b, 0) / item.prices.length;
                            const total = item.quantity * avg;
                            return (
                                <TableRow key={idx}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{currencyFormat(min)} đ</TableCell>
                                    <TableCell>{currencyFormat(max)} đ</TableCell>
                                    <TableCell>{currencyFormat(avg)} đ</TableCell>
                                    <TableCell>{currencyFormat(total)} đ</TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={5}><strong>Tổng tiền đã nhập</strong></TableCell>
                            <TableCell><strong>{currencyFormat(data.total)} đ</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" fontWeight="bold" gutterBottom>Thống kê nhập hàng theo nhà cung cấp</Typography>
            <Box sx={{ mb: 2, textAlign: 'left' }}>
                <Button variant="contained" sx={{ mr: 2 }} onClick={() => {
                    navigate(`/admin/profit`);
                }}>
                    Thống kê lợi nhuận
                </Button>
                <Button variant='contained' onClick={() => {
                    navigate('/admin/total');
                }}>
                    Thống kê lợi nhuận
                </Button>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                <TextField label="Từ ngày" type="date" InputLabelProps={{ shrink: true }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <TextField label="Đến ngày" type="date" InputLabelProps={{ shrink: true }} value={toDate} onChange={e => setToDate(e.target.value)} />
                <FormControl>
                    <InputLabel>Nhà cung cấp</InputLabel>
                    <Select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} sx={{ minWidth: 200 }}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleAnalyze}>Thống kê</Button>
            </Box>

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>Kết quả thống kê</Typography>
            {Object.keys(stats).length > 0 ? (
                Object.entries(stats).map(([supplierId, data]) => renderTable(supplierId, data))
            ) : (
                <Box mb={4}>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên món</TableCell>
                                    <TableCell>Số lượng nhập</TableCell>
                                    <TableCell>Giá thấp nhất</TableCell>
                                    <TableCell>Giá cao nhất</TableCell>
                                    <TableCell>Giá trung bình</TableCell>
                                    <TableCell>Tổng tiền</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ textAlign: 'center' }} colSpan={5}>Chưa có dữ liệu phù hợp với bộ lọc hiện tại</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Container>
    );
};

export default SupplierImportStats;
