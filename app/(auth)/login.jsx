import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import LoginBackground from "@/components/svg/LoginBack";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorLogin, resetSuccessLogin } from "@/redux/slices/session";
import { loginUser } from "@/redux/slices/session/loginUser";
import { useRouter } from "expo-router";
import { getUserData } from "@/redux/slices/user/getUserData";

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

      <View style={styles.formContainer}>
        <Text style={styles.title}>Inicia Sesión</Text>
        <Text style={styles.label}>Usuario o ID de Matrícula:</Text>
        <TextInput
          style={styles.input}
          onChangeText={formik.handleChange("username")}
          onBlur={formik.handleBlur("username")}
          value={formik.values.username}
        />
        {formik.touched.username && formik.errors.username && (
          <Text style={styles.errorText}>{formik.errors.username}</Text>
        )}

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
          value={formik.values.password}
        />
        {formik.touched.password && formik.errors.password && (
          <Text style={styles.errorText}>{formik.errors.password}</Text>
        )}

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPassword}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fcff",
    justifyContent: "center",
    alignItems: "center",
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
  formContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: "20%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#032b44",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#032b44",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#a1b0b9",
    marginBottom: 5,
    color: "#000",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  forgotPasswordContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#1f2d3d",
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#5c6bc0",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
