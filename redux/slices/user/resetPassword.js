import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";

export const resetPassword = createAsyncThunk('user/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/reset_password/${token}`, {
      password: password,
    })

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
  resetPassword: {
    loading: false,
    error: null,
    success: false
  },
}

const reducers = {
  clearResetPasswordState(state) {
    state.resetPassword.loading = initialState.resetPassword.loading
    state.resetPassword.error = initialState.resetPassword.error
    state.resetPassword.success = initialState.resetPassword.success
  },
}

function extraReducers(builder) {
  builder
    .addCase(resetPassword.pending, (state) => {
      state.resetPassword.loading = true
      state.resetPassword.success = false
      state.resetPassword.error = null
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.resetPassword.loading = false
      state.resetPassword.success = true
      state.resetPassword.error = null
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.resetPassword.loading = false
      state.resetPassword.success = false
      state.resetPassword.error = action.payload
    })
}

export default {
  resetPassword,
  initialState,
  reducers,
  extraReducers
}