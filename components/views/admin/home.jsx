import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useDispatch } from "react-redux";
import axiosInstance from "@/services/axiosInstance";
import { useEffect, useState, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { validateTicket } from "../../../redux/slices/tickets/validateTicket";
import { useTheme } from "@/context/ThemeContext";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const windowWidth = Dimensions.get("window").width;
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const styles = makeStyles(theme);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const response = await axiosInstance.get("/tickets/stats?date=today");
      setStats(response.data);
    } catch (err) {
      setStatsError(
        err.response?.data?.error?.detail ||
          err.response?.data?.detail ||
          "Error al cargar estadísticas"
      );
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined) return "$0.00";
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const ticketData = [
    {
      title: "Tickets Vendidos",
      value: stats ? stats.total : "—",
      icon: "ticket",
      color: "#3a6ea5",
    },
    {
      title: "Escaneados",
      value: stats ? stats.used : "—",
      icon: "ticket-confirmation",
      color: "#2e7d32",
    },
    {
      title: "Sin escanear",
      value: stats ? stats.unused : "—",
      icon: "ticket-outline",
      color: "#b45309",
    },
    {
      title: "Ingresos",
      value: stats ? formatMoney(stats.ingresos) : "—",
      icon: "cash",
      color: theme.mode === "dark" ? "#7AB8D9" : "#1e3a5f",
    },
  ];

  const handleBarCodeScanned = async ({ data }) => {
    if (isScanning) return;

    setIsScanning(true);
    setScanMessage({ type: "loading", text: "Validando..." });

    try {
      await dispatch(validateTicket({ ticket: data })).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScanMessage({ type: "success", text: "Ticket Válido" });
      fetchStats();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanMessage({ type: "error", text: error?.detail || "Ticket Inválido" });
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanMessage(null);
      }, 2000);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitas permitir el acceso a la cámara para escanear códigos QR"
        );
        return;
      }
    }
    setShowScanner(true);
  };

  const scanRate =
    stats && stats.total > 0
      ? Math.round((stats.used / stats.total) * 100)
      : 0;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.cardsContainer}>
          {loadingStats && !stats ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
          ) : statsError ? (
            <View style={styles.errorCard}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={28}
                color="#c62828"
              />
              <Text style={styles.errorText}>{statsError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchStats}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            ticketData.map((item, index) => (
              <View
                key={index}
                style={[styles.card, { width: windowWidth / 2 - 24 }]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color={item.color}
                />
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            ))
          )}
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Rendimiento Diario</Text>
                <MaterialCommunityIcons
                  name="refresh"
                  size={18}
                  color={theme.textSecondary}
                  onPress={fetchStats}
                />
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{scanRate}%</Text>
                  <Text style={styles.statLabel}>Tasa de Escaneo</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Vendidos</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${scanRate}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Tickets por Turno</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#e8a838" }]}>
                    {stats.by_schedule?.Desayuno ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Desayuno</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#3a6ea5" }]}>
                    {stats.by_schedule?.Almuerzo ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Almuerzo</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#4caf50" }]}>
                    {stats.by_schedule?.Comida ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Comida</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={openScanner}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={50}
            color={theme.mode === "dark" ? theme.primary : "#1e3a5f"}
          />
          <Text style={styles.bottomButtonLabel}>Escanear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/inventory/tickets")}
        >
          <MaterialCommunityIcons
            name="receipt"
            size={50}
            color={theme.mode === "dark" ? theme.primary : "#1e3a5f"}
          />
          <Text style={styles.bottomButtonLabel}>Tickets</Text>
        </TouchableOpacity>
      </View>

      {showScanner && (
        <View style={styles.scannerAbsoluteContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={[
                styles.scannerFrame,
                scanMessage?.type === "success" && styles.frameSuccess,
                scanMessage?.type === "error" && styles.frameError
              ]} />

              {scanMessage ? (
                <View style={[
                  styles.messageBadge,
                  scanMessage.type === "success" && styles.bgSuccess,
                  scanMessage.type === "error" && styles.bgError,
                  scanMessage.type === "loading" && styles.bgLoading
                ]}>
                  <Text style={styles.messageText}>{scanMessage.text}</Text>
                </View>
              ) : (
                <Text style={styles.scannerText}>Enfoca un código QR</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowScanner(false)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      )}
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    cardsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    loadingCard: {
      width: "100%",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      elevation: 2,
      gap: 12,
    },
    loadingText: { color: theme.textSecondary, fontSize: 14 },
    errorCard: {
      width: "100%",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      elevation: 2,
      gap: 8,
      borderLeftWidth: 4,
      borderLeftColor: "#c62828",
    },
    errorText: { color: "#c62828", textAlign: "center", fontSize: 14 },
    retryBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 4,
    },
    retryText: { color: "#fff", fontWeight: "600" },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
      alignItems: "center",
    },
    cardValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.textPrimary,
      marginTop: 8,
    },
    cardTitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    statsContainer: {
      marginBottom: 16,
    },
    statsCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statsTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.textPrimary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.mode === "dark" ? theme.primary : "#1e3a5f",
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: theme.mode === "dark" ? theme.primary : "#1e3a5f",
      borderRadius: 4,
    },
    bottomButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    bottomButton: {
      backgroundColor: theme.surfaceSecondary,
      padding: 16,
      borderRadius: 12,
      width: "44%",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    bottomButtonLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.mode === "dark" ? theme.primary : "#1e3a5f",
    },
    // Scanner (always dark — camera overlay)
    scannerAbsoluteContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "black",
      zIndex: 9999,
    },
    camera: { flex: 1 },
    scannerOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    scannerFrame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: "white",
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    scannerText: {
      marginTop: 20,
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 20,
      padding: 10,
      zIndex: 10,
    },
    messageBadge: {
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    messageText: { color: "white", fontSize: 18, fontWeight: "bold" },
    bgSuccess: { backgroundColor: "#2e7d32" },
    bgError: { backgroundColor: "#c62828" },
    bgLoading: { backgroundColor: "#1e3a5f" },
    frameSuccess: { borderColor: "#2e7d32", borderWidth: 4 },
    frameError: { borderColor: "#c62828", borderWidth: 4 },
  });
}
