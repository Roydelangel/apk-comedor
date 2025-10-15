import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/session";
import userReducer from "./slices/user";
import menuReducer from "./slices/menu";
import ticketReducer from "./slices/tickets";

const store = configureStore({
  devTools: true,
  reducer: {
    login: loginReducer,
    user: userReducer,
    menu: menuReducer,
    ticket: ticketReducer
  },
});

export default store;
