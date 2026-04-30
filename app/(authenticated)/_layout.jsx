import { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { Home, Ticket as TicketIcon } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import CustomHeader from "@/components/views/common/header";
import { getUserData } from "@/redux/slices/user/getUserData";
import { clearGetUserDataState, clearUserState } from "@/redux/slices/user";
import { useTheme } from "@/context/ThemeContext";

export default function AppLayout() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.user);
  const successLogin = useSelector((state) => state.login.successLogin);
  const successLogOut = useSelector((state) => state.login.successLogout);
  const { getUserData: getUserDataState } = useSelector((state) => state.user);

  console.log("User from APP LAYOUT: ", user ?? "");

  useEffect(() => {
    if (successLogOut) {
      dispatch(clearUserState());
    }

    if (!getUserDataState.success && !getUserDataState.loading) {
      dispatch(getUserData());
    }

    return () => {
      dispatch(clearGetUserDataState());
    };
  }, [successLogin, successLogOut, dispatch]);

  const homeLabel = user?.role === "Admin" ? "Dashboard" : "Menú";
  const ticketLabel = user?.role === "Admin" ? "Menus" : "Tickets";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        lazy: false,
        header: ({ options }) => <CustomHeader title={options.title} />,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.tabBar,
            shadowColor: theme.headerShadow,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: homeLabel,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.45 }}>
              <Home size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="menuTicket"
        options={{
          title: ticketLabel,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.45 }}>
              <TicketIcon size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    elevation: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabBarItem: {
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

