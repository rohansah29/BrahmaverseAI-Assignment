import { legacy_createStore, combineReducers } from "redux";
import orderReducer from "./orderSlice";

const rootReducer = combineReducers({
  order: orderReducer,
});

export const store = legacy_createStore(rootReducer);
