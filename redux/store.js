import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/session";
import userReducer from "./slices/user";
import menuReducer from "./slices/menu";
import ticketReducer from "./slices/tickets";
import themeReducer from "./slices/theme";

const store = configureStore({
  devTools: true,
  reducer: {
    login: loginReducer,
    user: userReducer,
    menu: menuReducer,
    ticket: ticketReducer,
    theme: themeReducer,
  },
});

export default store;
