
import { configureStore } from '@reduxjs/toolkit';
import hackReducer from './hack';
import modalReducer from './modal';

const store = configureStore({
    reducer: {
        hacks: hackReducer,
        modal: modalReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;