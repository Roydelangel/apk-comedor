import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useSelector } from "react-redux";

// ─── Token palettes ───────────────────────────────────────────────────────────
export const lightTheme = {
  mode: "light",
  background: "#F2F4F7",
  surface: "#FFFFFF",
  surfaceSecondary: "#FAFBFC",
  border: "#E8ECF0",
  primary: "#032b44",
  primaryMuted: "rgba(3, 43, 68, 0.08)",
  accent: "#8797A6",
  accentMuted: "rgba(135, 151, 166, 0.12)",
  textPrimary: "#032b44",
  textSecondary: "#8797A6",
  textPlaceholder: "#B0BEC5",
  inputBg: "#FAFBFC",
  tabBar: "#FFFFFF",
  tabBarActive: "#032b44",
  tabBarInactive: "#B0BEC5",
  danger: "#E0245E",
  dangerMuted: "rgba(224, 36, 94, 0.08)",
  statusBar: "dark-content",
  headerShadow: "#032b44",
};

export const darkTheme = {
  mode: "dark",
  background: "#0D1B26",
  surface: "#152333",
  surfaceSecondary: "#1A2B3C",
  border: "#253545",
  primary: "#7AB8D9",
  primaryMuted: "rgba(122, 184, 217, 0.12)",
  accent: "#6B8A9E",
  accentMuted: "rgba(107, 138, 158, 0.15)",
  textPrimary: "#E8F4FC",
  textSecondary: "#6B8A9E",
  textPlaceholder: "#4A6578",
  inputBg: "#1A2B3C",
  tabBar: "#152333",
  tabBarActive: "#7AB8D9",
  tabBarInactive: "#4A6578",
  danger: "#FF6B8A",
  dangerMuted: "rgba(255, 107, 138, 0.12)",
  statusBar: "light-content",
  headerShadow: "#000000",
};

// ─── Context ──────────────────────────────────────────────────────────────────
export const ThemeContext = createContext(lightTheme);

/**
 * Hook to access the current theme tokens.
 * Usage: const theme = useTheme();
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Provider component — wrap your app with this.
 * Reads the user's preference from Redux (theme.preference)
 * and the device color scheme as fallback.
 */
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const preference = useSelector((state) => state.theme?.preference ?? "system");

  const theme = useMemo(() => {
    if (preference === "light") return lightTheme;
    if (preference === "dark") return darkTheme;
    // 'system'
    return systemScheme === "dark" ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
