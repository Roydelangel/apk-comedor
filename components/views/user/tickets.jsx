import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Animated, { FadeIn } from "react-native-reanimated";
import NoTickets from "../../svg/noTickets";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { getUserData } from "@/redux/slices/user/getUserData";

const TicketView = () => {
  const [activeTab, setActiveTab] = useState("Desayuno");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleBuyPress = () => {
    router.push("/home");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getUserData());
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTickets = user?.user_tickets.filter(
    (ticket) => ticket?.menu?.schedule === activeTab
  );

  const renderContent = () => {
    if (filteredTickets.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No tienes tickets comprados</Text>
          <Text style={styles.emptyStateSubText}>
            Compra tickets para disfrutar de nuestro menú diario
          </Text>
          <View style={styles.emptyStateImage}>
            <NoTickets width={340} height={325} />
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress}>
            <Feather
              name="shopping-cart"
              size={20}
              color="#fff"
              style={styles.buyButtonIcon}
            />
            <Text style={styles.buyButtonText}>Comprar ticket</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentTicket = filteredTickets[0];

    return (
      <Animated.View entering={FadeIn} style={styles.ticketContent}>
        <View style={styles.ticketDetails}>
          <Text style={styles.ticketType}>{currentTicket.menu.schedule}</Text>
          <Text style={styles.ticketDate}>{currentTicket?.created_at}</Text>
          <Text style={styles.matriculaId}>ID Matricula: {user.id}</Text>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Escanee el código QR</Text>
          <View>
            <QRCode value={currentTicket?.ticket} size={250} color="#134563" />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.card}>
        <View style={styles.tabContainer}>
          {["Desayuno", "Almuerzo", "Comida"].map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.selectedTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.selectedTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#134563"]} // Color del spinner (opcional)
              tintColor="#134563" // Color del spinner para iOS (opcional)
            />
          }
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  ticketContent: {
    flex: 1,
    alignItems: "center",
  },
  ticketDetails: {
    alignItems: "center",
    marginBottom: 32,
  },
  ticketType: {
    fontSize: 24,
    fontWeight: "600",
    color: "#134563",
    marginBottom: 8,
  },
  ticketDate: {
    fontSize: 20,
    color: "#134563",
    marginBottom: 8,
  },
  ticketTime: {
    fontSize: 24,
    fontWeight: "500",
    color: "#134563",
    marginBottom: 16,
  },
  matriculaId: {
    fontSize: 16,
    color: "#134563",
  },
  qrContainer: {
    alignItems: "center",
  },
  qrText: {
    fontSize: 16,
    color: "#134563",
    marginBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#134563",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubText: {
    fontSize: 16,
    color: "#4A6572",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateImage: {
    marginBottom: "20%",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8797A6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buyButtonIcon: {
    marginRight: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TicketView;
