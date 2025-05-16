import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        updateUserStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateUserSuccess: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload };
            state.loading = false;
            state.error = null;
        },
        updateUserFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        signoutSuccess: (state) => {
            state.currentUser = null;
            state.error = null;
            state.loading = false;
        },

        setImageUrl: (state, action) => {
            if (state.currentUser) {
                state.currentUser.imageUrl = action.payload;
            }
        },
    },
});

export const { signInStart, signInSuccess, signInFailure, updateUserStart, updateUserSuccess, updateUserFailed, signoutSuccess, setImageUrl } = userSlice.actions;
export default userSlice.reducer;
