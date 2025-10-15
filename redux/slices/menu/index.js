import { createSlice } from "@reduxjs/toolkit";
import getDailyMenu from "./getDailyMenu";

export const menuSlice = createSlice({
  name: "menu",
  initialState: {
    ...getDailyMenu.initialState,
  },
  reducers: {
    ...getDailyMenu.reducers,
  },
  extraReducers: (builder) => {
    getDailyMenu.extraReducers(builder);
  },
});

export const { cleargetDailyMenuState } = menuSlice.actions;
export default menuSlice.reducer;
