import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productsReducer from "./productsSlice";
import cartReducer from "./cartSlice";
import uiReducer from "./uiSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    ui: uiReducer,
    settings: settingsReducer,
  },
});

export default store;
