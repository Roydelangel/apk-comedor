import Toast from "react-native-toast-message";
import axiosInstance from "@/services/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = createAsyncThunk('user/login', async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/login', {
            username: username,
            password: password
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
    isLoadingLogin: false,
    errorLogin: null,
    successLogin: false,
}

const reducers = {
    setSuccessLogin(state, action) {
        state.successLogin = action.payload
    },
    resetSuccessLogin(state) {
        state.successLogin = false
    },
    clearErrorLogin(state) {
        state.errorLogin = null
    },
}

function extraReducers(builder) {
    builder
        .addCase(loginUser.pending, (state) => {
            state.isLoadingLogin = true
            state.successLogin = false
            state.errorLogin = null
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            AsyncStorage.setItem('accessToken', JSON.stringify(action.payload.access));
            AsyncStorage.setItem('refreshToken', JSON.stringify(action.payload.refresh));
            state.isLoadingLogin = false
            state.successLogin = true
            state.errorLogin = null
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoadingLogin = false
            state.successLogin = false
            state.errorLogin = action.payload
            Toast.show({
                type: 'error',
                text1: 'Error de inicio de sesión',
                text2: action.payload?.detail || 'Servidor desconectado',
                visibilityTime: 4000,
                autoHide: true,
                swipeable: true
            })
        })
}


export default {
    loginUser,
    initialState,
    reducers,
    extraReducers
}