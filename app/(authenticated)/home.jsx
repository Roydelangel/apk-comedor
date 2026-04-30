import { useSelector } from "react-redux";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MenuScreen from "@/components/views/user/home";
import Dashboard from "@/components/views/admin/home";
import { GestureDetector, Gesture, Directions } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const theme = useTheme();

  const navigateToTickets = () => {
    router.navigate("/(authenticated)/menuTicket");
  };

  const fling = Gesture.Fling()
    .direction(Directions.LEFT)
    .numberOfPointers(1)
    .onEnd(() => {
      runOnJS(navigateToTickets)();
    });

  return (
    <GestureDetector gesture={fling}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {user?.role === "Admin" ? <Dashboard /> : <MenuScreen />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
