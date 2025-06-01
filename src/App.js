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
import StaffOrder from './staff/pages/StaffOrder/StaffOrder';
import AdminTotal from './admin/pages/AdminTotal/AdminTotal';
import AdminRole from './admin/pages/AdminRole/AdminRole';
import Users from './admin/pages/Member/Users/Users';
import Staffs from './admin/pages/Member/Staffs/Staffs';
import Reserve from './pages/Reserve/Reserve';
import Results from './pages/Results/Results';
import Seat from './staff/pages/Seat/Seat';
import StaffPayment from './staff/pages/StaffPayment/StaffPayment';
import DineIn from './staff/pages/DineIn/DineIn';
import StaffReserve from './staff/pages/StaffReserve/StaffReserve';


// Page not Found
import NotFound from './pages/NotFound/NotFound';

import { useState, useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { projectAuth, projectFirestore } from './firebase/config';

function App() {
  let theme = createTheme();

  const [user] = useAuthState(projectAuth);
  const [role, setRole] = useState([]);

  useEffect(() => {
    if (user != null) {
      const userRef = projectFirestore.collection('users').where('uid', '==', user.uid);

      const getUser = async () => {
        try {
          const querySnapshot = await userRef.get();

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setRole(doc.data().role);
          } else {
            console.log("Không tìm thấy user trong Firestore");
            setRole(null);
          }
        } catch (error) {
          console.error("Lỗi khi lấy user:", error);
          setRole(null);
        }
      };

      getUser();
    } else {
      setRole(null);
    }
  }, [user]);


  return (
    <CartProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <Navbar />
          <Routes>
            {/* user path */}

            <Route exact path='/' element={<Main />} />
            <Route exact path='/menu/:category' element={<Menu />} />
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
                  <Route exact path='/admin/users' element={<Users />} />
                  <Route exact path='/admin/staffs' element={<Staffs />} />
                  <Route exact path='/admin/seat' element={<Seat />} />
                  <Route exact path='/admin/payment' element={<StaffPayment />} />
                  <Route exact path='/admin/order' element={<StaffOrder />} />
                  <Route exact path='/admin/dinein' element={<DineIn />} />
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
                  <Route exact path='/staff/order' element={<StaffOrder />} />
                  <Route exact path='/staff/dinein' element={<DineIn />} />
                  <Route exact path='/staff/reserve' element={<StaffReserve />} />
                </>
              )
            }

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </ThemeProvider>
      </Router>
    </CartProvider>

  );
}

export default App;
