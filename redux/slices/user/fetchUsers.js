import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInstance";

const initialState = {
    fetchUsers: {
        success: false,
        loading: false,
        error: null,
        data: {
            count: 0,
            next: null,
            previous: null,
            results: []
        }
    }
}


export const fetchUsers = createAsyncThunk('user/fetchMany', async ({ queryParams }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/users',{
            params: queryParams,
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


const reducers = {
    clearFetchUsersState(state) {
        state.fetchUsers.success = initialState.fetchUsers.success
        state.fetchUsers.error = initialState.fetchUsers.error
        state.fetchUsers.loading = initialState.fetchUsers.loading
    }
}

function extraReducers(builder) {
    builder
        .addCase(fetchUsers.pending, (state) => {
            state.fetchUsers.success = false
            state.fetchUsers.loading = true
            state.fetchUsers.error = null
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.fetchUsers.success = true
            state.fetchUsers.loading = false
            state.fetchUsers.error = null
            state.fetchUsers.data = action.payload
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.fetchUsers.success = false
            state.fetchUsers.loading = false
            state.fetchUsers.error = action.payload
        })
}


export default {
    initialState,
    fetchUsers,
    reducers,
    extraReducers
}