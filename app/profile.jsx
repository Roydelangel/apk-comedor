import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/session/logoutUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La nueva contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña es requerida"),
});

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter()
  const { user } = useSelector((state) => state.user);

  const handleSubmit = (values) => {
    console.log(values);
  };

  const handleLogout = async () => {
    console.log(await AsyncStorage.getItem("refreshToken"));
    dispatch(
      logoutUser({ refreshToken: await AsyncStorage.getItem("refreshToken") })
    );
    await AsyncStorage.clear()
    router.replace("/login")
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="account-circle" size={80} color="#657786" />
            </View>
            <Text style={styles.userName}>{user?.id}</Text>
            <Text style={styles.userEmail}>{user?.role}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cambiar Contraseña</Text>

            <Formik
              initialValues={{
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <TextInput
                      style={styles.input}
                      secureTextEntry
                      value={values.newPassword}
                      onChangeText={handleChange("newPassword")}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    {touched.newPassword && errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                    <TextInput
                      style={styles.input}
                      secureTextEntry
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Actualizar Contraseña</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8fa",
    padding: 16,
    overflow: "scroll",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#14171A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#657786",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#14171A",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#657786",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E8ED",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#E0245E",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#8797A6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#E0245E",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
