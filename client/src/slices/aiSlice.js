import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const fetchCreations = createAsyncThunk('/ai/fetch-creations', async (getToken) => {

    const token = await getToken();

    const { data } = await axios.get('/api/user/get-user-creations', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data.creations;
});

const aiSlice = createSlice({
    name: 'ai',
    initialState: {
        creations: [],
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCreations.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(fetchCreations.fulfilled, (state, action) => {
            state.loading = false;
            state.creations = action.payload;
        });
        builder.addCase(fetchCreations.rejected, (state) => {
            state.loading = false;
        });
    }
});

export default aiSlice.reducer;
