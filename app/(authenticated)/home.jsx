import { useSelector } from "react-redux";
import { View, StyleSheet } from "react-native";
import MenuScreen from "@/components/views/user/home";
import Dashboard from "@/components/views/admin/home";

export default function Home() {
  const { user } = useSelector((state) => state.user);

  return (
    <View style={styles.container}>
      {user?.role === "Admin" ? <Dashboard /> : <MenuScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3ff",
    justifyContent: "center",
    alignItems: "center",
  },
});
