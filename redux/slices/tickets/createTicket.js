import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";
import Toast from "react-native-toast-message";

export const createTicket = createAsyncThunk(
  "user/create",
  async ({ user, menu }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/tickets", {
        user: user,
        menu: menu,
      });

      return response.data;
    } catch (err) {
      const errorBundle = {
        detail: err.response.data.error.detail,
        status: err.response.status,
        statusText: err.response.statusText,
      };
      return rejectWithValue(errorBundle);
    }
  }
);

const initialState = {
  createTicket: {
    loading: false,
    error: null,
    success: false,
  },
};

const reducers = {
  clearCreateTicketState(state) {
    state.createTicket.loading = initialState.createTicket.loading;
    state.createTicket.error = initialState.createTicket.error;
    state.createTicket.success = initialState.createTicket.success;
  },
};

function extraReducers(builder) {
  builder
    .addCase(createTicket.pending, (state) => {
      state.createTicket.loading = true;
      state.createTicket.success = false;
      state.createTicket.error = null;
    })
    .addCase(createTicket.fulfilled, (state, action) => {
      state.createTicket.loading = false;
      state.createTicket.success = true;
      state.createTicket.error = null;
      Toast.show({
        text1: "Ticket comprado",
        visibilityTime: 4000,
        autoHide: true,
        swipeable: true,
      });
    })
    .addCase(createTicket.rejected, (state, action) => {
      state.createTicket.loading = false;
      state.createTicket.success = false;
      state.createTicket.error = action.payload;
      Toast.show({
        type: "error",
        text1: "Error al comprar",
        text2: action.payload?.detail || "Servidor desconectado",
        visibilityTime: 4000,
        autoHide: true,
        swipeable: true,
      });
    });
}

export default {
  createTicket,
  initialState,
  reducers,
  extraReducers,
};
