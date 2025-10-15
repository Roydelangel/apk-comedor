import createUser from "./createUser";
import fetchUsers from "./fetchUsers";
import getUserData from "./getUserData";
import resetPassword from "./resetPassword";
import updateUserData from "./updateUserData";
import { createSlice } from "@reduxjs/toolkit";
import resetPasswordToken from "./resetPasswordToken";

const user = createSlice({
    name: 'userInfo',
    initialState: {
        user: null,
        ...createUser.initialState,
        ...getUserData.initialState,
        ...updateUserData.initialState,
        ...resetPasswordToken.initialState,
        ...resetPassword.initialState,
        ...fetchUsers.initialState
    },
    reducers: {
        ...createUser.reducers,
        ...getUserData.reducers,
        ...updateUserData.reducers,
        ...resetPasswordToken.reducers,
        ...resetPassword.reducers,
        ...fetchUsers.reducers,
        clearUserState(state) {
            state.user = null
        }
    },
    extraReducers: (builder) => {
        createUser.extraReducers(builder)
        getUserData.extraReducers(builder)
        updateUserData.extraReducers(builder)
        resetPasswordToken.extraReducers(builder)
        resetPassword.extraReducers(builder)
        fetchUsers.extraReducers(builder)
    }
})

export const {
    clearCreateUserState,
    clearUpdateUserData,
    clearGetUserDataState,
    clearUserState,
    clearResetPasswordTokenState,
    clearResetPasswordState,
    clearFetchUsersState
} = user.actions
export default user.reducer