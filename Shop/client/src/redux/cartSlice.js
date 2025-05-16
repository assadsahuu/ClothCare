import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: [],
    reducers: {
        addToCart: (state, action) => {
            const newItem = {
                ...action.payload,
                quantity: 1,
                // Explicitly include serviceType
                serviceType: action.payload.serviceType,
                
                id: action.payload.id,
                shopId: action.payload.shopId,
                user: action.payload.user,
            };

            if (state.length === 0) {
                state.push(newItem);
            } else {
                const currentShopId = state[0].shopId;
                if (currentShopId !== newItem.shopId) {
                    alert('You can only order from one shop at a time. Clear cart to change shops.');
                    return;
                }

                // Simplified check using composite ID only
                const existingItemIndex = state.findIndex(item => item.id === newItem.id);

                if (existingItemIndex >= 0) {
                    state[existingItemIndex].quantity += 1;
                } else {
                    state.push(newItem);
                }
            }
        },
        removeFromCart: (state, action) => {
            return state.filter(item => item.id !== action.payload);
        },
        clearCart: (state) => {
            return [];
        },
        incrementQuantity: (state, action) => {
            const item = state.find(item => item.id === action.payload);
            if (item) item.quantity += 1;
        },
        decrementQuantity: (state, action) => {
            const item = state.find(item => item.id === action.payload);
            if (item && item.quantity > 1) item.quantity -= 1;
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity
} = cartSlice.actions;

export default cartSlice.reducer;