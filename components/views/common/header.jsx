import { View, Text, StyleSheet, Pressable } from "react-native";
import HeaderIcon from "@/components/svg/headerIcon";
import UserCard from "@/components/svg/userCard";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const CustomHeader = ({ title }) => {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.background,
          shadowColor: theme.headerShadow,
        },
      ]}
    >
      <View style={styles.logoContainer}>
        <HeaderIcon width={50} height={30} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {title}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/profile")}
        style={({ pressed }) => [
          styles.avatarButton,
          pressed && [
            styles.avatarButtonPressed,
            { backgroundColor: theme.accentMuted },
          ],
        ]}
      >
        {user && <UserCard width={50} height={35} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    // shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  avatarButton: {
    borderRadius: 16,
    padding: 4,
  },
  avatarButtonPressed: {
    opacity: 0.7,
  },
});

export default CustomHeader;
