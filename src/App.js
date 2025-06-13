import './App.css';
import Navbar from './components/Navbar/Navbar';
import { ThemeProvider } from "@mui/styles";
import { createTheme } from '@mui/material/styles';
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

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import AdminMenu from './admin/pages/AdminMenu/AdminMenu';
import AdminEdit from './admin/pages/AdminEdit/AdminEdit';
import AdminTotal from './admin/pages/AdminTotal/AdminTotal';
import AdminRole from './admin/pages/AdminRole/AdminRole';
import Accounts from './admin/pages/Member/Accounts';
import Reserve from './pages/Reserve/Reserve';
import Results from './pages/Results/Results';
import Seat from './staff/pages/Seat/Seat';
import StaffPayment from './staff/pages/StaffPayment/StaffPayment';
import DineIn from './staff/pages/DineIn/DineIn';
import StaffReserve from './staff/pages/StaffReserve/StaffReserve';

// Staff and management functions can be common
import Orders from './staff/pages/Order/Orders';

// Page not Found
import NotFound from './pages/NotFound/NotFound';

// Contact Page
import Contact from './pages/Contact/Contact';

// Zalo icon
import ZaloButton from './components/Zalo/ZaloButton';

import { useState, useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { projectAuth, projectFirestore } from './firebase/config';

function App() {
  let theme = createTheme();

  const [user] = useAuthState(projectAuth);
  const [role, setRole] = useState([]);

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
