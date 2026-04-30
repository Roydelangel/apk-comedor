import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@theme_preference";

const initialState = {
  /** 'light' | 'dark' | 'system' */
  preference: "system",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemePreference(state, action) {
      state.preference = action.payload;
      // Persist asynchronously (fire & forget)
      AsyncStorage.setItem(STORAGE_KEY, action.payload).catch(() => {});
    },
  },
});

export const { setThemePreference } = themeSlice.actions;

export const THEME_STORAGE_KEY = STORAGE_KEY;

export default themeSlice.reducer;
