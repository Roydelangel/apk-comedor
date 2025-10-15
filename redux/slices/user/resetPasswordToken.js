import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";

export const resetPasswordToken = createAsyncThunk('user/resetPasswordToken', async ({ email }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/reset_password', {
      email: email,
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
  resetPasswordToken: {
    loading: false,
    error: null,
    success: false
  },
}

const reducers = {
  clearResetPasswordTokenState(state) {
    state.resetPasswordToken.loading = initialState.resetPasswordToken.loading
    state.resetPasswordToken.error = initialState.resetPasswordToken.error
    state.resetPasswordToken.success = initialState.resetPasswordToken.success
  },
}

function extraReducers(builder) {
  builder
    .addCase(resetPasswordToken.pending, (state) => {
      state.resetPasswordToken.loading = true
      state.resetPasswordToken.success = false
      state.resetPasswordToken.error = null
    })
    .addCase(resetPasswordToken.fulfilled, (state) => {
      state.resetPasswordToken.loading = false
      state.resetPasswordToken.success = true
      state.resetPasswordToken.error = null
    })
    .addCase(resetPasswordToken.rejected, (state, action) => {
      state.resetPasswordToken.loading = false
      state.resetPasswordToken.success = false
      state.resetPasswordToken.error = action.payload
    })
}

export default {
  resetPasswordToken,
  initialState,
  reducers,
  extraReducers
}