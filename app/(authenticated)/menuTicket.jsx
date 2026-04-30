import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import ViewMenusScreen from "@/components/views/admin/menus";
import TicketView from "@/components/views/user/tickets";
import { GestureDetector, Gesture, Directions } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

export default function MenuOrTicketScreen() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const theme = useTheme();

  const navigateToHome = () => {
    router.navigate("/(authenticated)/home");
  };

  const fling = Gesture.Fling()
    .direction(Directions.RIGHT)
    .numberOfPointers(1)
    .onEnd(() => {
      runOnJS(navigateToHome)();
    });

  return (
    <GestureDetector gesture={fling}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {user?.role === "Admin" ? <ViewMenusScreen /> : <TicketView />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});