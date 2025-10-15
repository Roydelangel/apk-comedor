import { createSlice } from "@reduxjs/toolkit"
import login from './loginUser'
import logout from './logoutUser'

export const sessionSlice = createSlice({
    name: 'session',
    initialState: {
        ...login.initialState,
        ...logout.initialState,
    },
    reducers: {
        ...login.reducers,
        ...logout.reducers,
    },
    extraReducers: (builder) => {
        login.extraReducers(builder)
        logout.extraReducers(builder)
    }
})

export const { setSuccessLogin, resetSuccessLogin, clearErrorLogin, resetSuccessLogout } = sessionSlice.actions
export default sessionSlice.reducer