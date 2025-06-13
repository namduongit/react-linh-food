import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [note, setNote] = useState('');
    const [total, setTotal] = useState(0);

    // Tự động tính tổng tiền khi cartItems thay đổi
    useEffect(() => {
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        setTotal(totalPrice);
    }, [cartItems]);

    // Thêm món vào giỏ
    const addToCart = (item) => {
        setCartItems((prev) => {
            const existingItem = prev.find((i) => i.id === item.id);
            if (existingItem) {
                return prev.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            } else {
                return [...prev, item];
            }
        });
    };

    // Xóa món khỏi giỏ
    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    // Đặt lại giỏ hàng (khi thanh toán xong)
    const clearCart = () => {
        setCartItems([]);
        setNote('');
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                addToCart,
                removeFromCart,
                clearCart,
                total,
                note,
                setNote,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
