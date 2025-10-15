import "../global.css";
import store from "@/redux/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import AuthWrapper from "@/services/authWrapper";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthWrapper>
        <StatusBar barStyle="dark-content" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(authenticated)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="inventory" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile"
            options={{ headerShown: true, headerTitle: "Configuración" }}
          />
          <Stack.Screen name="screens/menus" options={{ headerShown: false }} />
          <Stack.Screen
            name="screens/tickets"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthWrapper>
      <Toast position="bottom" bottomOffset={20} />
    </Provider>
  );
}
