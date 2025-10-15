import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";

export const updateUserData = createAsyncThunk('user/update', async ({ user_id, email, name, phone, password = null }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put('/profile', {
      id: user_id,
      email: email,
      password: password,
      name: name,
      phone: phone,
      password: password
    },)

    return response.data
  } catch (err) {
    const errorBundle = {
      detail: err.response.data.error.detail,
      status: err.response.status,
      statusText: err.response.statusText
    }
    return rejectWithValue(errorBundle)
  }
})

const initialState = {
  updateUserData: {
    loading: false,
    error: null,
    success: false,
  }
}

const reducers = {
  clearUpdateUserData(state) {
    state.updateUserData.loading = initialState.updateUserData.loading
    state.updateUserData.error = initialState.updateUserData.error
    state.updateUserData.success = initialState.updateUserData.success
  }
}

function extraReducers(builder) {
  builder
  builder
    .addCase(updateUserData.pending, (state) => {
      state.updateUserData.loading = true;
      state.updateUserData.success = false;
      state.updateUserData.error = null;
    })
    .addCase(updateUserData.fulfilled, (state, action) => {
      state.updateUserData.loading = false;
      state.updateUserData.success = true;
      state.updateUserData.error = null;
      state.user = action.payload;
    })
    .addCase(updateUserData.rejected, (state, action) => {
      state.updateUserData.loading = false;
      state.updateUserData.success = false;
      state.updateUserData.error = action.payload;
    })
}

export default {
  updateUserData,
  initialState,
  reducers,
  extraReducers
}