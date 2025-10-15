import { createSlice } from "@reduxjs/toolkit";
import createTicket from "./createTicket";
import validateTicket from "./validateTicket"

export const ticketSlice = createSlice({
  name: "menu",
  initialState: {
    ...createTicket.initialState,
    ...validateTicket.initialState,
  },
  reducers: {
    ...createTicket.reducers,
    ...validateTicket.reducers,
  },
  extraReducers: (builder) => {
    createTicket.extraReducers(builder);
    validateTicket.extraReducers(builder);
  },
});

export const { clearCreateTicketState, clearValidateTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
