import { useEffect } from "react";
import { Tabs } from "expo-router";
import Ticket from "@/components/svg/ticket";
import HomeIcon from "@/components/svg/home";
import { useDispatch, useSelector } from "react-redux";
import CustomHeader from "@/components/views/common/header";
import { getUserData } from "@/redux/slices/user/getUserData";
import { clearGetUserDataState, clearUserState } from "@/redux/slices/user";


export default function AppLayout() {
  const dispatch = useDispatch();
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

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        lazy: true,
        header: ({ options }) => <CustomHeader title={options.title} />,
        tabBarActiveTintColor: "#4A6572",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: user?.role == "Admin" ? "Dashboard" : "Menu",
          tabBarIcon: () => <HomeIcon />,
        }}
      />

      <Tabs.Screen
        name="menu-or-ticket"
        options={{
          title: user?.role === "Admin" ? "Menus" : "Tickets",
          tabBarIcon: () => <Ticket />,
        }}
      />

      <Tabs.Screen
        name={user?.role == "Admin" ? "menus" : "tickets"}
        options={{
          title: user?.role == "Admin" ? "Menusa" : "Tickets",
          tabBarIcon: () => <Ticket />,
        }}
      />
    </Tabs>
  );
}
