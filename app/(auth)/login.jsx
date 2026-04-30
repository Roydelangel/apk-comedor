import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import LoginBackground from "@/components/svg/LoginBack";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorLogin, resetSuccessLogin } from "@/redux/slices/session";
import { loginUser } from "@/redux/slices/session/loginUser";
import { useRouter } from "expo-router";
import { getUserData } from "@/redux/slices/user/getUserData";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("El usuario es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const error = useSelector((state) => state.login.errorLogin);
  const success = useSelector((state) => state.login.successLogin);

  useEffect(() => {
    if (success) {
      dispatch(resetSuccessLogin());
      dispatch(getUserData());
      if (user) {
        router.push("/home");
      }
      setTimeout(() => {}, 1000);
    } else if (error) {
      dispatch(clearErrorLogin());
    }
  }, [success, error, dispatch]);

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema,
    onSubmit: (values) => {
      try {
        dispatch(
          loginUser({ username: values.username, password: values.password })
        );
      } catch (error) {
        console.error("Error submitting form", error);
      }
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.bgContainer}>
        <LoginBackground width="100%" height="100%" />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.formCard}
        >
          <Animated.Text
            entering={FadeIn.delay(200).duration(400)}
            style={styles.title}
          >
            Inicia Sesión
          </Animated.Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario o ID de Matrícula</Text>
            <TextInput
              style={[
                styles.input,
                formik.touched.username &&
                  formik.errors.username &&
                  styles.inputError,
              ]}
              onChangeText={formik.handleChange("username")}
              onBlur={formik.handleBlur("username")}
              value={formik.values.username}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#A0B0BC"
              autoCapitalize="none"
            />
            {formik.touched.username && formik.errors.username && (
              <Text style={styles.errorText}>{formik.errors.username}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                formik.touched.password &&
                  formik.errors.password &&
                  styles.inputError,
              ]}
              secureTextEntry
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              value={formik.values.password}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#A0B0BC"
            />
            {formik.touched.password && formik.errors.password && (
              <Text style={styles.errorText}>{formik.errors.password}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPassword}>¿Olvidó su contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={formik.handleSubmit}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fcff",
  },
  bgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    width: "88%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 28,
    padding: 32,
    marginBottom: "15%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#032b44",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#032b44",
    marginBottom: 32,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A6572",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  input: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    borderWidth: 1.5,
    borderColor: "transparent",
    fontSize: 16,
    color: "#032b44",
  },
  inputError: {
    borderColor: "#E0245E",
    backgroundColor: "rgba(224, 36, 94, 0.04)",
  },
  errorText: {
    color: "#E0245E",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPassword: {
    color: "#8797A6",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#8797A6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#8797A6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
