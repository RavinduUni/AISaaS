import { configureStore } from "@reduxjs/toolkit";
import aiReducer from "../slices/aiSlice";

const store = configureStore({
    reducer: {
        creations: aiReducer
    }
});

export default store;