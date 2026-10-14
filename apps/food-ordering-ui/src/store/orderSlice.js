const initialState = {
  cart: {},
  cartPrices: {},
  selectedFoodId: 1,
  productQuantity: 3,
};

const SELECT_FOOD = "order/selectFood";
const SET_PRODUCT_QUANTITY = "order/setProductQuantity";
const ADD_ITEM = "order/addItem";
const SET_ITEM_QUANTITY = "order/setItemQuantity";
const REMOVE_ITEM = "order/removeItem";

export const selectFood = (food) => ({ type: SELECT_FOOD, payload: food });
export const setProductQuantity = (quantity) => ({ type: SET_PRODUCT_QUANTITY, payload: quantity });
export const addItem = (item) => ({ type: ADD_ITEM, payload: item });
export const setItemQuantity = (item) => ({ type: SET_ITEM_QUANTITY, payload: item });
export const removeItem = (foodId) => ({ type: REMOVE_ITEM, payload: foodId });

export default function orderReducer(state = initialState, action) {
  switch (action.type) {
    case SELECT_FOOD: {
      const foodId = action.payload.id;
      return {
        ...state,
        selectedFoodId: foodId,
        productQuantity: state.cart[foodId] || 1,
      };
    }
    case SET_PRODUCT_QUANTITY: {
      const productQuantity = Math.max(1, action.payload);
      const cart = state.cart[state.selectedFoodId]
        ? { ...state.cart, [state.selectedFoodId]: productQuantity }
        : state.cart;
      return { ...state, productQuantity, cart };
    }
    case ADD_ITEM: {
      const { foodId, quantity = 1, unitPrice } = action.payload;
      const cart = { ...state.cart, [foodId]: (state.cart[foodId] || 0) + quantity };
      const cartPrices = unitPrice === undefined
        ? state.cartPrices
        : { ...state.cartPrices, [foodId]: unitPrice };
      return {
        ...state,
        cart,
        cartPrices,
        productQuantity: state.selectedFoodId === foodId ? cart[foodId] : state.productQuantity,
      };
    }
    case SET_ITEM_QUANTITY: {
      const { foodId, quantity, unitPrice } = action.payload;
      const cart = { ...state.cart };
      if (quantity > 0) cart[foodId] = quantity;
      else delete cart[foodId];
      const cartPrices = { ...state.cartPrices };
      if (quantity > 0 && unitPrice !== undefined) cartPrices[foodId] = unitPrice;
      else if (quantity <= 0) delete cartPrices[foodId];
      return {
        ...state,
        cart,
        cartPrices,
        productQuantity:
          state.selectedFoodId === foodId
            ? quantity > 0 ? quantity : 1
            : state.productQuantity,
      };
    }
    case REMOVE_ITEM: {
      const cart = { ...state.cart };
      const cartPrices = { ...state.cartPrices };
      delete cart[action.payload];
      delete cartPrices[action.payload];
      return {
        ...state,
        cart,
        cartPrices,
        productQuantity: state.selectedFoodId === action.payload ? 1 : state.productQuantity,
      };
    }
    default:
      return state;
  }
}

export const selectCart = (state) => state.order.cart;
export const selectCartPrices = (state) => state.order.cartPrices;
export const selectCartCount = (state) =>
  Object.values(state.order.cart).reduce((total, quantity) => total + quantity, 0);
export const selectProductQuantity = (state) => state.order.productQuantity;
export const selectSelectedFood = (state, foods) =>
  foods.find((food) => food.id === state.order.selectedFoodId);
