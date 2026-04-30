import "../global.css";
import store from "@/redux/store";
import { Stack } from "expo-router";
import { Provider, useSelector, useDispatch } from "react-redux";
import { StatusBar, useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import AuthWrapper from "@/services/authWrapper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { setThemePreference, THEME_STORAGE_KEY } from "@/redux/slices/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

// ─── Inner layout — has access to Redux + ThemeContext ────────────────────────
function AppNavigator() {
  const dispatch = useDispatch();
  const theme = useTheme();

  // Hydrate persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored && ["light", "dark", "system"].includes(stored)) {
        dispatch(setThemePreference(stored));
      }
    });
  }, []);

  return (
    <>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(authenticated)" />
        <Stack.Screen name="inventory" />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: "Configuración",
            headerTintColor: theme.textPrimary,
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerShadowVisible: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="screens/menus" />
        <Stack.Screen name="screens/tickets" />
      </Stack>
    </>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthWrapper>
            <AppNavigator />
          </AuthWrapper>
          <Toast position="bottom" bottomOffset={20} />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
