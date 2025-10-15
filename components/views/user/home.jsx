import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  VirtualizedList,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getDailyMenu } from "@/redux/slices/menu/getDailyMenu";
import { createTicket } from "../../../redux/slices/tickets/createTicket";
import { Pressable } from "react-native";

const MenuScreen = () => {
  const dispatch = useDispatch();
  const { getDailyMenu: getDailyMenuState } = useSelector(
    (state) => state.menu
  );
  const { user } = useSelector((state) => state.user);
  const [selectedTab, setSelectedTab] = useState("Desayuno");
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleBuy = (user, menu) => {
    dispatch(createTicket({ user: user, menu: menu }));
    console.log("Compra confirmada");
    setIsModalVisible(false);
  };
zz
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(getDailyMenu());
  };

  useEffect(() => {
    dispatch(getDailyMenu());
  }, []);

  useEffect(() => {
    if (!getDailyMenuState.loading && refreshing) {
      setRefreshing(false);
    }
  }, [getDailyMenuState.loading]);

  const getSelectedMenu = () => {
    if (!getDailyMenuState.data?.results) return null;
    return getDailyMenuState.data.results.find(
      (menu) => menu.schedule === selectedTab
    );
  };

  const selectedMenu = getSelectedMenu();
  const menuItems = selectedMenu?.menu_items || [];

  const calculateTotal = () => {
    return menuItems
      .reduce((sum, item) => sum + parseFloat(item.price), 0)
      .toFixed(2);
  };

  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  const MenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>${item.price}</Text>
      <View style={styles.dottedLineContainer}>
        <Text style={styles.dottedLine}>{"- ".repeat(40)}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => <MenuItem item={item} />;

  if (getDailyMenuState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8797A6" />
      </View>
    );
  }

  if (getDailyMenuState.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error cargando el menú</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.tabContainer}>
          {["Desayuno", "Almuerzo", "Comida"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.selectedTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.selectedTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuContainer}>
          <VirtualizedList
            data={menuItems}
            initialNumToRender={4}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            getItemCount={getItemCount}
            getItem={getItem}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() =>
              menuItems.length > 0 ? (
                <View style={styles.totalContainer}>
                  <View style={styles.dottedLineContainer}>
                    <Text style={styles.dottedLine}>{"- ".repeat(40)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${calculateTotal()}</Text>
                  </View>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#8797A6"]}
                tintColor={"#8797A6"}
              />
            }
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>
                No hay menú para este horario aún
              </Text>
            )}
          />
        </View>
      </View>
      {menuItems.length > 0 && (
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.buyButtonText}>Comprar</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar compra</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas comprar el menú de {selectedTab} por
              un total de ${calculateTotal()}?
            </Text>

            <View style={styles.modalButtonsContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleBuy(user.id, selectedMenu.id)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: "100%",
    display: "flex",
  },
  card: {
    flex: 1,
    padding: 16,
    elevation: 3,
    shadowRadius: 4,
    borderRadius: 16,
    shadowOpacity: 0.1,
    shadowColor: "#000",
    backgroundColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedTab: {
    backgroundColor: "#8797A6",
  },
  tabText: {
    color: "#666",
    fontSize: 16,
  },
  selectedTabText: {
    color: "#fff",
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    marginVertical: 8,
  },
  itemName: {
    fontSize: 20,
    color: "#2C3E50",
  },
  dottedLineContainer: {
    height: 10,
    overflow: "hidden",
  },
  dottedLine: {
    height: 10,
    color: "#000",
    letterSpacing: 1,
  },
  itemPrice: {
    fontSize: 20,
    marginTop: -20,
    color: "#2C3E50",
    alignSelf: "flex-end",
  },
  totalContainer: {
    marginTop: 20,
  },
  totalRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 20,
    color: "#2C3E50",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 20,
    color: "#2C3E50",
    fontWeight: "600",
  },
  buyButton: {
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#8797A6",
  },
  buyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 32,
    color: "#666",
    marginTop: "50%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: "#8797A6",
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default MenuScreen;
