import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { validateTicket } from "../../../redux/slices/tickets/validateTicket";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const windowWidth = Dimensions.get("window").width;
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);

  const ticketData = [
    { title: "Tickets Vendidos", value: 145, icon: "ticket", color: "#3a6ea5" },
    {
      title: "Tickets Escaneados",
      value: 98,
      icon: "ticket-confirmation",
      color: "#5d8aa8",
    },
    {
      title: "Sin escanear",
      value: 47,
      icon: "ticket-outline",
      color: "#6c93b4",
    },
    { title: "Ingresos", value: "$2,175", icon: "cash", color: "#1e3a5f" },
  ];

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setShowScanner(false);
    dispatch(validateTicket({ ticket: data }));
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

  return (
    <View>
      <ScrollView style={styles.content}>
        <View style={styles.cardsContainer}>
          {ticketData.map((item, index) => (
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
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Rendimiento Diario</Text>
              <MaterialIcons name="more-vert" size={20} color="#666" />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>67%</Text>
                <Text style={styles.statLabel}>Tasa de Escaneo</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>23%</Text>
                <Text style={styles.statLabel}>Crecimiento</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Tickets por Categoría</Text>
              <MaterialIcons name="more-vert" size={20} color="#666" />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>72</Text>
                <Text style={styles.statLabel}>Desayuno</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.statLabel}>Almuerzo</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>28</Text>
                <Text style={styles.statLabel}>Comida</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={openScanner}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={50}
            color="#1e3a5f"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/inventory/tickets")}
        >
          <MaterialCommunityIcons name="receipt" size={50} color="#1e3a5f" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={showScanner}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Enfoca un código QR</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowScanner(false)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginLeft: 8,
  },
  profileButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 4,
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    height: "20%",
  },
  bottomButton: {
    display: "flex",
    backgroundColor: "#a1b0b9ff",
    padding: 16,
    borderRadius: 12,
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
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
  },
});
