import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: {},
  selectedFoodId: 1,
  productQuantity: 3,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    selectFood(state, action) {
      const foodId = action.payload.id;
      state.selectedFoodId = foodId;
      state.productQuantity = state.cart[foodId] || 1;
    },
    setProductQuantity(state, action) {
      state.productQuantity = Math.max(1, action.payload);
      if (state.cart[state.selectedFoodId]) {
        state.cart[state.selectedFoodId] = state.productQuantity;
      }
    },
    addItem(state, action) {
      const { foodId, quantity = 1 } = action.payload;
      state.cart[foodId] = (state.cart[foodId] || 0) + quantity;
      if (state.selectedFoodId === foodId) {
        state.productQuantity = state.cart[foodId];
      }
    },
    setItemQuantity(state, action) {
      const { foodId, quantity } = action.payload;
      if (quantity > 0) state.cart[foodId] = quantity;
      else delete state.cart[foodId];
      if (state.selectedFoodId === foodId) {
        state.productQuantity = quantity > 0 ? quantity : 1;
      }
    },
    removeItem(state, action) {
      delete state.cart[action.payload];
      if (state.selectedFoodId === action.payload) state.productQuantity = 1;
    },
  },
});

export const { selectFood, setProductQuantity, addItem, setItemQuantity, removeItem } =
  orderSlice.actions;

export const selectCart = (state) => state.order.cart;
export const selectCartCount = (state) =>
  Object.values(state.order.cart).reduce((total, quantity) => total + quantity, 0);
export const selectProductQuantity = (state) => state.order.productQuantity;
export const selectSelectedFood = (state, foods) =>
  foods.find((food) => food.id === state.order.selectedFoodId);

export default orderSlice.reducer;
