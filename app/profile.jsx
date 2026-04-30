import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/session/logoutUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";
import { setThemePreference } from "@/redux/slices/theme";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La nueva contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña es requerida"),
});

// ─── Theme option definition ──────────────────────────────────────────────────
const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: "light-mode" },
  { value: "system", label: "Sistema", icon: "brightness-auto" },
  { value: "dark", label: "Oscuro", icon: "dark-mode" },
];

// ─── Theme Selector component ─────────────────────────────────────────────────
function ThemeSelector({ theme }) {
  const dispatch = useDispatch();
  const preference = useSelector((state) => state.theme?.preference ?? "system");
  const styles = makeStyles(theme);

  const [trackWidth, setTrackWidth] = useState(0);
  const activeIndex = THEME_OPTIONS.findIndex(opt => opt.value === preference);
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (trackWidth > 0) {
      const tabWidth = (trackWidth - 8) / 3;
      indicatorX.value = withSpring(activeIndex * tabWidth, {
        damping: 20,
        stiffness: 200,
        mass: 0.8
      });
    }
  }, [activeIndex, trackWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = trackWidth > 0 ? (trackWidth - 8) / 3 : 0;
    return {
      width: tabWidth,
      transform: [{ translateX: indicatorX.value }],
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(450)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>Apariencia</Text>
      <View 
        style={styles.themeTrack}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {trackWidth > 0 && (
          <Animated.View style={[styles.themeIndicator, indicatorStyle]} />
        )}
        
        {THEME_OPTIONS.map(({ value, label, icon }) => {
          const active = preference === value;
          return (
            <Pressable
              key={value}
              onPress={() => dispatch(setThemePreference(value))}
              style={styles.themeOptionAnimated}
              accessibilityRole="button"
              accessibilityLabel={`Tema ${label}`}
              accessibilityState={{ selected: active }}
            >
              <MaterialIcons
                name={icon}
                size={20}
                color={active ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.themeLabelAnimated,
                  active && styles.themeLabelAnimatedActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useSelector((state) => state.user);
  const styles = makeStyles(theme);

  const handleSubmit = (values) => {
    console.log(values);
  };

  const handleLogout = async () => {
    console.log(await AsyncStorage.getItem("refreshToken"));
    dispatch(
      logoutUser({ refreshToken: await AsyncStorage.getItem("refreshToken") })
    );
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── User header ── */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <MaterialIcons name="person" size={40} color={theme.accent} />
              </View>
            </View>
            <Text style={styles.userName}>{user?.id}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </Animated.View>

          {/* ── Theme selector ── */}
          <ThemeSelector theme={theme} />

          {/* ── Change password card ── */}
          <Animated.View
            entering={FadeInDown.delay(220).duration(500)}
            style={[styles.card, { marginTop: 16 }]}
          >
            <Text style={styles.cardTitle}>Cambiar Contraseña</Text>

            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.newPassword &&
                          errors.newPassword &&
                          styles.inputError,
                      ]}
                      secureTextEntry
                      value={values.newPassword}
                      onChangeText={handleChange("newPassword")}
                      placeholder="Ingresa tu nueva contraseña"
                      placeholderTextColor={theme.textPlaceholder}
                    />
                    {touched.newPassword && errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                      secureTextEntry
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      placeholder="Confirma tu nueva contraseña"
                      placeholderTextColor={theme.textPlaceholder}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Actualizar Contraseña</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </Animated.View>

          {/* ── Logout ── */}
          <Animated.View
            entering={FadeInDown.delay(360).duration(400)}
            style={styles.logoutContainer}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons
                name="logout"
                size={20}
                color={theme.danger}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Dynamic styles factory ───────────────────────────────────────────────────
function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    // Header
    header: {
      alignItems: "center",
      marginBottom: 20,
      marginTop: 8,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.textPrimary,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    roleBadge: {
      backgroundColor: theme.accentMuted,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
    },
    roleText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    // Card
    card: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 18,
      letterSpacing: -0.2,
    },
    // Theme selector
    themeTrack: {
      flexDirection: "row",
      backgroundColor: theme.background,
      borderRadius: 14,
      padding: 4,
    },
    themeIndicator: {
      position: "absolute",
      left: 4,
      top: 4,
      bottom: 4,
      borderRadius: 11,
      backgroundColor: theme.primaryMuted,
    },
    themeOptionAnimated: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      zIndex: 1,
    },
    themeLabelAnimated: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
      letterSpacing: 0.2,
    },
    themeLabelAnimatedActive: {
      color: theme.primary,
    },
    // Form
    inputContainer: {
      marginBottom: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    input: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: theme.inputBg,
      color: theme.textPrimary,
    },
    inputError: {
      borderColor: theme.danger,
      backgroundColor: `${theme.dangerMuted}`,
    },
    errorText: {
      color: theme.danger,
      fontSize: 12,
      fontWeight: "500",
      marginTop: 6,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    // Logout
    logoutContainer: {
      marginTop: 32,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 8 : 16,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.dangerMuted,
      borderRadius: 14,
      paddingVertical: 16,
    },
    logoutText: {
      color: theme.danger,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
