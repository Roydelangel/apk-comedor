import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";

export const getUserData = createAsyncThunk('user/get', async (args, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/user')

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
  getUserData: {
    loading: false,
    error: null,
    success: false,
  },
}

const reducers = {
  clearGetUserDataState(state) {
    state.getUserData.loading = initialState.getUserData.loading
    state.getUserData.error = initialState.getUserData.error
    state.getUserData.success = initialState.getUserData.success
  },
}

function extraReducers(builder) {
  builder
    .addCase(getUserData.pending, (state) => {
      state.getUserData.loading = true
      state.getUserData.success = false
      state.getUserData.error = null
    })
    .addCase(getUserData.fulfilled, (state, action) => {
      state.getUserData.loading = false
      state.getUserData.success = true
      state.getUserData.error = null
      state.user = action.payload
    })
    .addCase(getUserData.rejected, (state, action) => {
      state.getUserData.loading = false
      state.getUserData.success = false
      state.getUserData.error = action.payload
    })
}

export default {
  getUserData,
  initialState,
  reducers,
  extraReducers
}