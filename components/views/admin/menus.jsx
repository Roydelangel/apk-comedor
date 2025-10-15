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
// Definición de estructura de datos
const ViewMenusScreen = () => {

  // Estados para la lista de menús
  const [menus, setMenus] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("Desayuno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
z
  // Estados para el modal de creación de menú
  const [modalVisible, setModalVisible] = useState(false);
  const [newMenuSchedule, setNewMenuSchedule] = useState("Desayuno");
  const [menuItems, setMenuItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar menús al iniciar y cuando cambie el horario seleccionado
  useEffect(() => {
    fetchMenus();
  }, [selectedSchedule]);

  // Función para obtener los menús
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

  // Función para eliminar un menú
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
              await axios.delete(`/menu/${menuId}`);
              fetchMenus(); // Recargar la lista después de eliminar
            } catch (err) {
              const errorMessage =
                err.response?.data?.message || "Error al eliminar el menú";
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Función para agregar un nuevo elemento al menú en el modal
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
      id: Date.now().toString(), // Usar timestamp como ID temporal
    };

    setMenuItems([...menuItems, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    setModalError(null);
  };

  // Función para eliminar un elemento del menú en el modal
  const removeMenuItem = (id) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  // Función para enviar el formulario del modal
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
        menuItems: menuItems.map(({ id, ...item }) => item), // Eliminar IDs temporales
      };

      await axios.post("/menu", menuData);

      // Mostrar mensaje de éxito

      // Cerrar el modal y limpiar el formulario
      setModalVisible(false);
      resetModalForm();

      // Recargar la lista de menús si el horario coincide con el filtro actual
      if (newMenuSchedule === selectedSchedule) {
        fetchMenus();
      }
    } catch (err) {
      // Manejar el error
      const errorMessage =
        err.response?.data?.message || "Error al guardar el menú";
      setModalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Función para resetear el formulario del modal
  const resetModalForm = () => {
    setNewMenuSchedule("Desayuno");
    setMenuItems([]);
    setNewItemName("");
    setNewItemPrice("");
    setModalError(null);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalVisible(false);
    resetModalForm();
  };

  // Renderizar un menú individual
  const renderMenu = (menu) => {
    return (
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
          {menu.menuItems.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar las estadísticas de menús por categoría
  const renderMenuStats = () => {
    let menuCounts = {
      Desayuno: 0,
      Almuerzo: 0,
      Comida: 0,
    };

    if(menus){
      menuCounts = {
        Desayuno: menus?.filter((menu) => menu.schedule === "Desayuno").length,
        Almuerzo: menus?.filter((menu) => menu.schedule === "Almuerzo").length,
        Comida: menus?.filter((menu) => menu.schedule === "Comida").length,
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Estadísticas de menús */}
        {!loading && !error && renderMenuStats()}

        {/* Lista de menús */}
        <View style={styles.menusContainer}>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator
                size="large"
                color="#2E5B9A"
                style={styles.loader}
              />
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

        {/* Botón para crear nuevo menú */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Crear Nuevo Menú</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para crear nuevo menú */}
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

              {/* Selector de horario en el modal */}
              <Text style={styles.modalLabel}>Horario</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={newMenuSchedule}
                  onValueChange={(value) => setNewMenuSchedule(value)}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Desayuno" value="Desayuno" />
                  <Picker.Item label="Almuerzo" value="Almuerzo" />
                  <Picker.Item label="Comida" value="Comida" />
                </Picker>
              </View>

              {/* Sección para agregar elementos en el modal */}
              <Text style={styles.modalSectionTitle}>Agregar Elemento</Text>
              <View style={styles.modalInputRow}>
                <TextInput
                  style={[styles.modalInput, styles.modalNameInput]}
                  placeholder="Nombre del plato"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalPriceInput]}
                  placeholder="Precio"
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

              {/* Lista de elementos del menú en el modal */}
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

              {/* Mensaje de error en el modal */}
              {modalError && (
                <Text style={styles.modalErrorText}>{modalError}</Text>
              )}

              {/* Botones de acción del modal */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAEEF2",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E5B9A",
  },
  container: {
    flex: 1,
    backgroundColor: "#EAEEF2",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  filterCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  picker: {
    height: 50,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E5B9A",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  menusContainer: {
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    borderBottomColor: "#EEEEEE",
  },
  menuSchedule: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E5B9A",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  menuItemsContainer: {
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemName: {
    fontSize: 16,
    color: "#333",
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E5B9A",
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  loader: {
    marginVertical: 8,
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2E5B9A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#2E5B9A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalScrollContainer: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#2E5B9A",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  modalPickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
  },
  modalPicker: {
    height: 50,
    paddingHorizontal: 4
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#2E5B9A",
  },
  modalInputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9F9F9",
  },
  modalNameInput: {
    flex: 2,
    marginRight: 8,
  },
  modalPriceInput: {
    flex: 1,
    marginRight: 8,
    width: "20%",
  },
  modalAddButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#2E5B9A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#2E5B9A",
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
    borderBottomColor: "#EEEEEE",
  },
  modalMenuItemInfo: {
    flex: 1,
  },
  modalMenuItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalMenuItemPrice: {
    fontSize: 14,
    color: "#2E5B9A",
    marginTop: 4,
    fontWeight: "500",
  },
  modalDeleteButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modalDeleteButtonText: {
    color: "white",
    fontSize: 14,
  },
  modalEmptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 16,
  },
  modalErrorText: {
    color: "#FF5252",
    marginVertical: 8,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSubmitButton: {
    flex: 2,
    backgroundColor: "#2E5B9A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalDisabledButton: {
    backgroundColor: "#90CAF9",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ViewMenusScreen;
