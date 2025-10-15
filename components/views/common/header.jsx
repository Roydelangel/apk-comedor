import { View, Text, StyleSheet, Button, Pressable } from "react-native";
import HeaderIcon from "@/components/svg/headerIcon";
import UserCard from "@/components/svg/userCard";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

const CustomHeader = ({ title }) => {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  console.log("User from header: ", user);

  return (
    <View style={styles.container}>
      <View style={styles.logo_container}>
        <HeaderIcon width={50} height={30} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <Pressable onPress={() => router.push("/profile")}>
        {user && <UserCard width={50} height={35} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: "#e3e3e3ff",
    borderBottomColor: "#000406ff",
    justifyContent: "space-between",
  },
  logo_container: {
    gap: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#032b44ff",
  },
  button: {
    width: "fit"
  }
});

export default CustomHeader;
