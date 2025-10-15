import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";
import Toast from "react-native-toast-message";

export const validateTicket = createAsyncThunk(
  "ticket/validate",
  async ({ ticket }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/tickets/${ticket}`);

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
  validateTicket: {
    loading: false,
    error: null,
    success: false,
  },
};

const reducers = {
  clearValidateTicketState(state) {
    state.validateTicket.loading = initialState.validateTicket.loading;
    state.validateTicket.error = initialState.validateTicket.error;
    state.validateTicket.success = initialState.validateTicket.success;
  },
};

function extraReducers(builder) {
  builder
    .addCase(validateTicket.pending, (state) => {
      state.validateTicket.loading = true;
      state.validateTicket.success = false;
      state.validateTicket.error = null;
    })
    .addCase(validateTicket.fulfilled, (state, action) => {
      state.validateTicket.loading = false;
      state.validateTicket.success = true;
      state.validateTicket.error = null;
      Toast.show({
        text1: "Ticket Válido",
        visibilityTime: 4000,
        autoHide: true,
        swipeable: true,
      });
    })
    .addCase(validateTicket.rejected, (state, action) => {
      state.validateTicket.loading = false;
      state.validateTicket.success = false;
      state.validateTicket.error = action.payload;
      Toast.show({
        type: "error",
        text1: "Error al validar",
        text2: action.payload?.detail || "Servidor desconectado",
        visibilityTime: 4000,
        autoHide: true,
        swipeable: true,
      });
    });
}

export default {
  validateTicket,
  initialState,
  reducers,
  extraReducers,
};
