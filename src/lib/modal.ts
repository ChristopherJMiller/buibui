import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Hack } from "./hack";


export interface ModalState {
    open: boolean,
    selectedHack?: Hack,
}

const initialState: ModalState = {
    open: false,
    selectedHack: undefined,
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openHack: (state, action: PayloadAction<Hack>) => {
            state.selectedHack = action.payload;
            state.open = true;
        },
        closeModal: (state) => {
            state.selectedHack = undefined;
            state.open = false;
        }
    }
});

export const { openHack, closeModal } = modalSlice.actions;
export default modalSlice.reducer;