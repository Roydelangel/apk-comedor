import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";


export const createUser = createAsyncThunk('user/create', async ({ email, password, phone, name }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/create', {
      email: email,
      password: password,
      name: name,
      phone: phone
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
  createUser: {
    loading: false,
    error: null,
    success: false
  },
}

const reducers = {
  clearCreateUserState(state) {
    state.createUser.loading = initialState.createUser.loading
    state.createUser.error = initialState.createUser.error
    state.createUser.success = initialState.createUser.success
  },
}

function extraReducers(builder) {
  builder
    .addCase(createUser.pending, (state) => {
      state.createUser.loading = true
      state.createUser.success = false
      state.createUser.error = null
    })
    .addCase(createUser.fulfilled, (state, action) => {
      state.createUser.loading = false
      state.createUser.success = true
      state.createUser.error = null
    })
    .addCase(createUser.rejected, (state, action) => {
      state.createUser.loading = false
      state.createUser.success = false
      state.createUser.error = action.payload
    })
}

export default {
  createUser,
  initialState,
  reducers,
  extraReducers
}