import './App.css';
import Navbar from './components/Navbar/Navbar';
import { ThemeProvider } from "@mui/styles";
import { createTheme } from '@mui/material/styles';

// Router
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// User Element
import Main from './pages/Main/Main';
import Footer from './components/Footer/Footer';
import AdminMain from './admin/pages/AdminMain/AdminMain'
import Menu from './pages/Menu/Menu';
import Details from './pages/Details/Details';
import Cart from './pages/Cart/Cart';
import Payment from './pages/Payment/Payment';
import Order from './pages/Order/Order';
import History from './pages/History/History';
import CartProvider from './context/CartContext';
import Reserve from './pages/Reserve/Reserve';
import Results from './pages/Results/Results';
import DiscountedMenu from './pages/Discount/Discount';

// Admin Element
import AdminMenu from './admin/pages/AdminMenu/AdminMenu';
import AdminEdit from './admin/pages/AdminEdit/AdminEdit';
import AdminTotal from './admin/pages/AdminTotal/AdminTotal';
import AdminRole from './admin/pages/AdminRole/AdminRole';
import Accounts from './admin/pages/Member/Accounts';
import AdminInbound from './admin/pages/AdminInbound/AdminInbound';
import AdminProfit from './admin/pages/AdminProfit/AdminProfit';
import AddInbound from './admin/pages/AddInbound/AddInbound';
import AdminKey from './admin/pages/AdminKey/AdminKey';
import AdminSupplier from './admin/pages/AdminSupplier/AdminSupplier';
import AdminSupplierStats from './admin/pages/AdminSupplierStats/AdminSupplierStats';
import AdminMainPage from './admin/pages/AdminMainPage/AdminMainPage';
import AdminExport from './admin/pages/AdminExport/AdminExport';
import DiscountManager from './admin/pages/DiscountManager/DiscountManager';

// Staff Element
import Seat from './staff/pages/Seat/Seat';
import StaffPayment from './staff/pages/StaffPayment/StaffPayment';
import DineIn from './staff/pages/DineIn/DineIn';
import Orders from './staff/pages/Order/Orders';
import StaffReserve from './staff/pages/StaffReserve/StaffReserve';

// Component and Page
import NotFound from './pages/NotFound/NotFound';
import Contact from './pages/Contact/Contact';
import ZaloButton from './components/Zalo/ZaloButton';

// Service
import { toast } from './services/toast';

import { useState, useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { projectAuth, projectFirestore } from './firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';


function App() {
  let theme = createTheme();

  const [user] = useAuthState(projectAuth);
  const [role, setRole] = useState([]);

  const [docs, setDocs] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);

  useEffect(() => {
    if (user != null) {
      projectFirestore.collection('users')
        .where('uid', '==', user.uid)
        .onSnapshot((snap) => {
          snap.forEach(doc => {
            setRole(doc.data().role);
          });
        })
    } else setRole(null)
  }, [user]);

  useEffect(() => {
    if (user != null) {
      projectFirestore.collection('menu')
        .where('quantity', '<=', 0)
        .orderBy('quantity')
        .orderBy('price', 'asc')
        .onSnapshot(snap => {
          let documents = [];
          snap.forEach(doc => {
            documents.push({
              ...doc.data(),
              id: doc.id
            })
          })
          setOutOfStock(documents)
        });
      projectFirestore.collection('cart')
        .where('uid', '==', user.uid)
        .onSnapshot((snap) => {
          let documents = [];
          snap.forEach(doc => {
            documents.push({
              ...doc.data(),
              id: doc.id
            })
          });
          setDocs(documents)
        })
    }
  }, [user]);

  // Xử lý bỏ hàng đó ra khỏi giỏ
  useEffect(() => {
    var dataCheck = [];
    outOfStock.forEach(outItem => {
      docs.forEach(doc => {
        if (outItem.id == doc.menuId) dataCheck.push(doc);
      })
    })


    if (dataCheck.length > 0) {
      dataCheck.forEach(async data => {
        await deleteDoc(doc(projectFirestore, 'cart', data.id))
      })
      toast({
        title: 'Thông báo',
        message: 'Xóa các sản phẩm hết hàng trong giỏ hàng',
        type: 'success',
        duration: 3000
      })
    }

  }, [docs, outOfStock])

  const [data, setData] = useState([]);
  useEffect(() => {
    
  })

  return (
    <CartProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <div className="app-container">
            <Navbar />
            <div className='main-container'>
              <Routes>
                {/* user path */}

                <Route exact path='/' element={<Main />} />
                <Route exact path='/menu/:category' element={<Menu />} />
                <Route exact path='/menu/contact' element={<Contact />} />
                <Route exact path='/details/:id' element={<Details />} />
                <Route exact path='/user/order' element={<Order />} />
                <Route exact path='/user/history' element={<History />} />
                <Route exact path='/cart' element={<Cart />} />
                <Route exact path='/payment' element={<Payment />} />
                <Route exact path='/user/reserve' element={<Reserve />} />
                <Route exact path='/search/:keyword' element={<Results />} />
                <Route exact path='/menu/discount' element={<DiscountedMenu />} />
                {/* admin path */}
                {
                  role === 'admin' && ( 
                    <>
                      <Route exact path="/admin/add-menu" element={<AdminMain />} />
                      <Route exact path='/admin/menu' element={<AdminMenu />} />
                      <Route exact path='/admin/edit-menu/:id' element={<AdminEdit />} />
                      <Route exact path='/admin/total' element={<AdminTotal />} />
                      <Route exact path='/admin/role' element={<AdminRole />} />
                      <Route exact path='/admin/accounts' element={<Accounts />} />
                      <Route exact path='/admin/seat' element={<Seat />} />
                      <Route exact path='/admin/payment' element={<StaffPayment />} />
                      <Route exact path='/admin/reserve' element={<StaffReserve />} />
                      <Route exact path='/admin/inbound' element={<AdminInbound />} />
                      <Route exact path='/admin/add-inbound' element={<AddInbound />} />
                      <Route exact path='/admin/profit' element={<AdminProfit />} />
                      <Route exact path='/admin/key-manager' element={<AdminKey />} />
                      <Route exact path='/admin/supplier' element={<AdminSupplier />} />
                      <Route exact path='/admin/supplier-stats' element={<AdminSupplierStats />} />
                      <Route exact path='/admin/main-page' element={<AdminMainPage />} />
                      <Route exact path='/admin/exports' element={<AdminExport />}/>
                      <Route exact path='/admin/discounts' element={<DiscountManager />} />
                    </>
                  )
                }
                
                {/* staff path */}
                {
                  role === 'staff' && (
                    <>
                      <Route exact path='/staff/seat' element={<Seat />} />
                      <Route exact path='/staff/payment' element={<StaffPayment />} />
                      <Route exact path='/staff/reserve' element={<StaffReserve />} />
                    </>
                  )
                }

                {/* Admin and Staff Path */}
                {
                  (role === 'staff' || role === 'admin') && (
                    <>
                      <Route exact path='/admin/order' element={<Orders />} />
                      <Route exact path='/staff/order' element={<Orders />} />
                      <Route exact path='/admin/dinein' element={<DineIn />} />
                      <Route exact path='/staff/dinein' element={<DineIn />} />
                      <Route exact path='/order' element={<Orders />} />
                      <Route exact path='/dinein' element={<DineIn />} />
                    </>
                  )
                }


                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
            <ZaloButton />
          </div>
        </ThemeProvider>
      </Router>
    </CartProvider>

  );
}

export default App;
