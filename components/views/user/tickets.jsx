import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import NoTickets from "../../svg/noTickets";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getUserData } from "@/redux/slices/user/getUserData";
import { useTheme } from "@/context/ThemeContext";

const SCHEDULES = ["Desayuno", "Almuerzo", "Comida"];

const TicketView = () => {
  const { schedule } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(schedule || "Desayuno");
  const [refreshing, setRefreshing] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.user);
  const indicatorX = useSharedValue(0);
  const activeIndex = SCHEDULES.indexOf(activeTab);

  const styles = makeStyles(theme);

  useEffect(() => {
    if (schedule) setActiveTab(schedule);
  }, [schedule]);

  useEffect(() => {
    if (trackWidth > 0) {
      const tabWidth = (trackWidth - 8) / 3;
      indicatorX.value = withTiming(activeIndex * tabWidth, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
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
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.emptyStateContainer}
        >
          <Text style={styles.emptyStateText}>No tienes tickets</Text>
          <Text style={styles.emptyStateSubText}>
            Compra tickets para disfrutar de nuestro menú diario
          </Text>
          <View style={styles.emptyStateImage}>
            <NoTickets width={280} height={260} />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buyButton}
            onPress={handleBuyPress}
          >
            <Feather
              name="shopping-cart"
              size={18}
              color="#fff"
              style={styles.buyButtonIcon}
            />
            <Text style={styles.buyButtonText}>Comprar ticket</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    const currentTicket = filteredTickets[0];

    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.ticketContent}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.ticketCard}
        >
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketScheduleLabel}>HORARIO</Text>
            <Text style={styles.ticketType}>
              {currentTicket.menu.schedule}
            </Text>
          </View>

          <View style={styles.perforatedDivider}>
            <View style={styles.perforationLeft} />
            <View style={styles.perforationLine} />
            <View style={styles.perforationRight} />
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={currentTicket?.ticket}
                size={200}
                color={theme.textPrimary}
                backgroundColor={theme.surface}
              />
            </View>
            <Text style={styles.qrHint}>Muestra este código al escanear</Text>
          </View>

          <View style={styles.ticketFooter}>
            <View style={styles.ticketInfoRow}>
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>FECHA</Text>
                <Text style={styles.ticketInfoValue}>
                  {currentTicket?.created_at}
                </Text>
              </View>
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>ID MATRÍCULA</Text>
                <Text style={styles.ticketInfoValue}>{user.id}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.card}>
        <View style={styles.tabContainer}>
          <View
            style={styles.tabTrack}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            {trackWidth > 0 && (
              <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
            )}

            {SCHEDULES.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.7}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.selectedTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.accent]}
              tintColor={theme.accent}
            />
          }
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      width: "100%",
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      flex: 1,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    tabContainer: { marginBottom: 24 },
    tabTrack: {
      flexDirection: "row",
      backgroundColor: theme.background,
      borderRadius: 14,
      padding: 4,
    },
    tabIndicator: {
      position: "absolute",
      left: 4,
      top: 4,
      bottom: 4,
      borderRadius: 11,
      backgroundColor: theme.accent,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      zIndex: 1,
    },
    tabText: {
      color: theme.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
    selectedTabText: { color: "#fff" },
    ticketContent: {
      flex: 1,
      alignItems: "center",
      paddingTop: 8,
    },
    ticketCard: {
      width: "100%",
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      overflow: "hidden",
    },
    ticketHeader: {
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 24,
      backgroundColor: theme.surfaceSecondary,
    },
    ticketScheduleLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    ticketType: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: -0.5,
    },
    perforatedDivider: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: -1.5,
    },
    perforationLeft: {
      width: 16,
      height: 32,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      backgroundColor: theme.background,
    },
    perforationLine: {
      flex: 1,
      height: 1.5,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: theme.border,
    },
    perforationRight: {
      width: 16,
      height: 32,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: theme.background,
    },
    qrSection: {
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 24,
    },
    qrWrapper: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    qrHint: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 14,
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    ticketFooter: { paddingHorizontal: 24, paddingBottom: 24 },
    ticketInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    ticketInfoItem: { flex: 1 },
    ticketInfoLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    ticketInfoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 24,
    },
    emptyStateText: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyStateSubText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 22,
      paddingHorizontal: 16,
    },
    emptyStateImage: { marginBottom: 32 },
    buyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 14,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    buyButtonIcon: { marginRight: 10 },
    buyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
}

export default TicketView;
