import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "@/services/axiosInstance";
import { useTheme } from "@/context/ThemeContext";

const ViewMenusScreen = () => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [menus, setMenus] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("Desayuno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newMenuSchedule, setNewMenuSchedule] = useState("Desayuno");
  const [menuItems, setMenuItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, [selectedSchedule]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/menu?date=today`);
      setMenus(response.data.results || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al cargar los menús";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro de que desea eliminar este menú?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await axiosInstance.delete(`/menu/${menuId}`);
              fetchMenus();
            } catch (err) {
              const errorMessage =
                err.response?.data?.error?.detail ||
                err.response?.data?.message ||
                "Error al eliminar el menú";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const addMenuItem = () => {
    if (!newItemName.trim()) {
      setModalError("El nombre del elemento es requerido");
      return;
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      setModalError("El precio debe ser un número válido mayor que 0");
      return;
    }
    const newItem = {
      name: newItemName.trim(),
      price: price,
      id: Date.now().toString(),
    };
    setMenuItems([...menuItems, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    setModalError(null);
  };

  const removeMenuItem = (id) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const handleSubmitNewMenu = async () => {
    if (menuItems.length === 0) {
      setModalError("Debe agregar al menos un elemento al menú");
      return;
    }
    setSubmitting(true);
    setModalError(null);
    try {
      const menuData = {
        schedule: newMenuSchedule,
        menu_items: menuItems.map(({ id, ...item }) => item),
      };
      await axiosInstance.post("/menu", menuData);
      setModalVisible(false);
      resetModalForm();
      fetchMenus();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.detail ||
        err.response?.data?.message ||
        "Error al guardar el menú";
      setModalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetModalForm = () => {
    setNewMenuSchedule("Desayuno");
    setMenuItems([]);
    setNewItemName("");
    setNewItemPrice("");
    setModalError(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetModalForm();
  };

  const renderMenu = (menu) => (
    <View key={menu.id} style={styles.menuCard}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuSchedule}>{menu.schedule}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMenu(menu.id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menuItemsContainer}>
        {(menu.menu_items ?? []).map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemPrice}>
              ${parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMenuStats = () => {
    let menuCounts = { Desayuno: 0, Almuerzo: 0, Comida: 0 };
    if (menus) {
      menuCounts = {
        Desayuno: menus?.filter((m) => m.schedule === "Desayuno").length,
        Almuerzo: menus?.filter((m) => m.schedule === "Almuerzo").length,
        Comida: menus?.filter((m) => m.schedule === "Comida").length,
      };
    }
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Tickets por Categoría</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{menuCounts.Desayuno}</Text>
            <Text style={styles.statLabel}>Desayuno</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{menuCounts.Almuerzo}</Text>
            <Text style={styles.statLabel}>Almuerzo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{menuCounts.Comida}</Text>
            <Text style={styles.statLabel}>Comida</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
      >
        {!loading && !error && renderMenuStats()}

        <View style={styles.menusContainer}>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
              <Text style={styles.loadingText}>Cargando menús...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMenus}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : menus.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No hay menús disponibles para {selectedSchedule}
              </Text>
            </View>
          ) : (
            menus.map(renderMenu)
          )}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Crear Nuevo Menú</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <Text style={styles.modalTitle}>Crear Nuevo Menú</Text>

              <Text style={styles.modalLabel}>Horario</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={newMenuSchedule}
                  onValueChange={(value) => setNewMenuSchedule(value)}
                  style={[styles.modalPicker, { color: theme.textPrimary }]}
                  dropdownIconColor={theme.textSecondary}
                >
                  <Picker.Item label="Desayuno" value="Desayuno" />
                  <Picker.Item label="Almuerzo" value="Almuerzo" />
                  <Picker.Item label="Comida" value="Comida" />
                </Picker>
              </View>

              <Text style={styles.modalSectionTitle}>Agregar Elemento</Text>
              <View style={styles.modalInputRow}>
                <TextInput
                  style={[styles.modalInput, styles.modalNameInput]}
                  placeholder="Nombre del plato"
                  placeholderTextColor={theme.textPlaceholder}
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalPriceInput]}
                  placeholder="Precio"
                  placeholderTextColor={theme.textPlaceholder}
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.modalAddButton}
                  onPress={addMenuItem}
                >
                  <Text style={styles.modalButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionTitle}>Elementos del Menú</Text>
              {menuItems.length === 0 ? (
                <Text style={styles.modalEmptyText}>
                  No hay elementos en el menú
                </Text>
              ) : (
                menuItems.map((item) => (
                  <View key={item.id} style={styles.modalMenuItem}>
                    <View style={styles.modalMenuItemInfo}>
                      <Text style={styles.modalMenuItemName}>{item.name}</Text>
                      <Text style={styles.modalMenuItemPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.modalDeleteButton}
                      onPress={() => removeMenuItem(item.id)}
                    >
                      <Text style={styles.modalDeleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {modalError && (
                <Text style={styles.modalErrorText}>{modalError}</Text>
              )}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={closeModal}
                  disabled={submitting}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSubmitButton,
                    submitting && styles.modalDisabledButton,
                  ]}
                  onPress={handleSubmitNewMenu}
                  disabled={submitting}
                >
                  <Text style={styles.modalSubmitButtonText}>
                    {submitting ? "Guardando..." : "Guardar Menú"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function makeStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    statsCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 16,
      color: theme.textPrimary,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    statItem: { alignItems: "center" },
    statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    menusContainer: { marginBottom: 16 },
    menuCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuSchedule: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
    },
    deleteButton: {
      backgroundColor: "#FF5252",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    deleteButtonText: { color: "white", fontSize: 14, fontWeight: "500" },
    menuItemsContainer: { marginTop: 4 },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemName: { fontSize: 16, color: theme.textPrimary },
    menuItemPrice: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
    },
    loadingCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      elevation: 2,
    },
    loadingText: { marginTop: 12, fontSize: 16, color: theme.textSecondary },
    loader: { marginVertical: 8 },
    errorCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
      elevation: 2,
      borderLeftWidth: 4,
      borderLeftColor: "#FF5252",
    },
    errorText: { color: "#D32F2F", marginBottom: 16, textAlign: "center" },
    retryButton: {
      backgroundColor: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    retryButtonText: { color: "white", fontWeight: "500" },
    emptyCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      elevation: 2,
    },
    emptyText: { fontSize: 16, color: theme.textSecondary, textAlign: "center" },
    createButton: {
      backgroundColor: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      elevation: 3,
    },
    createButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
    // Modal
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      padding: 16,
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      maxWidth: 500,
      maxHeight: "90%",
      elevation: 5,
    },
    modalScrollContainer: { flexGrow: 1 },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: theme.textPrimary,
    },
    modalPickerContainer: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: theme.inputBg,
    },
    modalPicker: { height: 50, paddingHorizontal: 4 },
    modalSectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 8,
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
    },
    modalInputRow: { flexDirection: "row", marginBottom: 16 },
    modalInput: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.inputBg,
      color: theme.textPrimary,
    },
    modalNameInput: { flex: 2, marginRight: 8 },
    modalPriceInput: { flex: 1, marginRight: 8, width: "20%" },
    modalAddButton: {
      width: 50,
      height: 50,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    modalButtonText: {
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      fontSize: 24,
      fontWeight: "bold",
    },
    modalMenuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalMenuItemInfo: { flex: 1 },
    modalMenuItemName: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    modalMenuItemPrice: {
      fontSize: 14,
      color: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      marginTop: 4,
      fontWeight: "500",
    },
    modalDeleteButton: {
      backgroundColor: "#FF5252",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    modalDeleteButtonText: { color: "white", fontSize: 14 },
    modalEmptyText: {
      textAlign: "center",
      color: theme.textSecondary,
      fontStyle: "italic",
      marginVertical: 16,
    },
    modalErrorText: { color: "#FF5252", marginVertical: 8 },
    modalButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: theme.surfaceSecondary,
      paddingVertical: 14,
      borderRadius: 8,
      marginRight: 8,
      alignItems: "center",
    },
    modalCancelButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: "600",
    },
    modalSubmitButton: {
      flex: 2,
      backgroundColor: theme.mode === "dark" ? theme.primary : "#2E5B9A",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    modalDisabledButton: { backgroundColor: theme.accentMuted },
    modalSubmitButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  });
}

export default ViewMenusScreen;
