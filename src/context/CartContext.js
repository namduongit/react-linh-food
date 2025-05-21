import { createContext, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [total, setTotal] = useState(0);
    const [note, setNote] = useState('');

    return (
        <CartContext.Provider 
            value={{ 
                total,
                setTotal,
                note,
                setNote
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export default CartProvider
