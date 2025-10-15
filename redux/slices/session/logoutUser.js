import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/services/axiosInstance"


export const logoutUser = createAsyncThunk('user/logout', async ({ refreshToken }, { rejectWithValue }) => {
    try {
        await axiosInstance.post('/logout', {
            refreshToken: refreshToken
        })
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
    isLoadingLogout: false,
    errorLogout: null,
    successLogout: false,
}

const reducers = {
    resetSuccessLogout(state) {
        state.successLogout = false
    }
}


function extraReducers(builder) {
    builder
        .addCase(logoutUser.pending, (state) => {
            state.isLoadingLogout = true
            state.successLogout = false
            state.errorLogout = null
        })
        .addCase(logoutUser.fulfilled, (state, action) => {
            state.isLoadingLogout = false
            state.successLogout = true
            state.errorLogout = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        })
        .addCase(logoutUser.rejected, (state, action) => {
            state.isLoadingLogout = false
            state.successLogout = false
            state.errorLogout = action.payload
        })
}


export default {
    logoutUser,
    initialState,
    reducers,
    extraReducers
}