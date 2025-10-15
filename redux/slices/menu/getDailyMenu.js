import Toast from "react-native-toast-message";
import axiosInstance from "@/services/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getDailyMenu = createAsyncThunk(
  "menu/get-daily",
  async (args, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menu?date=today");
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
  getDailyMenu: {
    loading: false,
    error: null,
    success: false,
    data: { count: 0, next: null, previous: null, results: [] },
  },
};

const reducers = {
  cleargetDailyMenuState(state) {
    state.getDailyMenu.loading = initialState.getDailyMenu.loading;
    state.getDailyMenu.error = initialState.getDailyMenu.error;
    state.getDailyMenu.success = initialState.getDailyMenu.success;
    state.getDailyMenu.data = initialState.getDailyMenu.data;
  },
};

function extraReducers(builder) {
  builder
    .addCase(getDailyMenu.pending, (state) => {
      state.getDailyMenu.loading = true;
      state.getDailyMenu.success = false;
      state.getDailyMenu.error = null;
    })
    .addCase(getDailyMenu.fulfilled, (state, action) => {
      state.getDailyMenu.loading = false;
      state.getDailyMenu.success = true;
      state.getDailyMenu.error = null;
      state.getDailyMenu.data = action.payload;
    })
    .addCase(getDailyMenu.rejected, (state, action) => {
      state.getDailyMenu.loading = false;
      state.getDailyMenu.success = false;
      state.getDailyMenu.error = action.payload;
      Toast.show({
        type: "error",
        text1: "Error al obtener datos",
        text2: action.payload?.detail || "Servidor desconectado",
        visibilityTime: 4000,
        autoHide: true,
        swipeable: true,
      });
    });
}

export default {
  getDailyMenu,
  initialState,
  reducers,
  extraReducers,
};
