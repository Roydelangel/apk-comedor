import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  VirtualizedList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getDailyMenu } from "@/redux/slices/menu/getDailyMenu";
import { createTicket } from "../../../redux/slices/tickets/createTicket";
import { clearCreateTicketState } from "../../../redux/slices/tickets";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { CircleCheck, UtensilsCrossed, ShoppingCart, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getUserData } from "@/redux/slices/user/getUserData";
import { useTheme } from "@/context/ThemeContext";

const SCHEDULES = ["Desayuno", "Almuerzo", "Comida"];

const MenuScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { getDailyMenu: getDailyMenuState } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.user);
  const { createTicket: createTicketState } = useSelector((state) => state.ticket);
  const [selectedTab, setSelectedTab] = useState("Desayuno");
  const [refreshing, setRefreshing] = useState(false);

  const styles = makeStyles(theme);

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["45%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsAtThreshold={0.1}
        appearsAtThreshold={0.2}
        opacity={0.5}
      />
    ),
    []
  );
  const [trackWidth, setTrackWidth] = useState(0);

  const indicatorX = useSharedValue(0);
  const activeIndex = SCHEDULES.indexOf(selectedTab);

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

  const hasTicketForSchedule = (schedule) => {
    return user?.user_tickets?.some(
      (ticket) => ticket?.menu?.schedule === schedule
    );
  };

  const selectedMenuHasTicket = hasTicketForSchedule(selectedTab);

  const handleBuy = (user, menu) => {
    dispatch(createTicket({ user: user, menu: menu }));
    handleDismissModal();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(getDailyMenu());
  };

  useEffect(() => {
    dispatch(getDailyMenu());
    dispatch(getUserData());
  }, []);

  useEffect(() => {
    if (createTicketState.success) {
      dispatch(getUserData());
      dispatch(clearCreateTicketState());
    }
  }, [createTicketState.success]);

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
      .reduce((sum, item) => {
        const price = parseFloat(item.price);
        return sum + (isNaN(price) ? 0 : price);
      }, 0)
      .toFixed(2);
  };

  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  const MenuItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={styles.menuItem}
    >
      <View style={styles.menuItemRow}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.menuItemDivider} />
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>
    </Animated.View>
  );

  const renderItem = ({ item, index }) => (
    <MenuItem item={item} index={index} />
  );

  if (getDailyMenuState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
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
    <BottomSheetModalProvider>
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
                const hasTicket = hasTicketForSchedule(tab);
                const isActive = selectedTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.7}
                    style={styles.tab}
                    onPress={() => setSelectedTab(tab)}
                  >
                    <View style={styles.tabInner}>
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.selectedTabText,
                        ]}
                      >
                        {tab}
                      </Text>
                      {hasTicket && (
                        <View
                          style={[
                            styles.purchasedDot,
                            isActive && styles.purchasedDotActive,
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
                  <Animated.View
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.totalContainer}
                  >
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalAmount}>${calculateTotal()}</Text>
                    </View>
                  </Animated.View>
                ) : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.accent]}
                  tintColor={theme.accent}
                />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconWrap}>
                    <UtensilsCrossed size={40} color={theme.accent} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyText}>
                    No hay menú para este horario
                  </Text>
                  <Text style={styles.emptySubText}>
                    Desliza hacia abajo para actualizar
                  </Text>
                </View>
              )}
            />
          </View>

          {menuItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(200).duration(500)}
              style={styles.buttonContainer}
            >
              {!selectedMenuHasTicket ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.buyButton}
                  onPress={handlePresentModalPress}
                >
                  <Text style={styles.buyButtonText}>Comprar ticket</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.purchasedBanner}>
                  <View style={styles.purchasedBannerLeft}>
                    <CircleCheck size={22} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.purchasedBannerText}>
                      Ticket adquirido
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/(authenticated)/menuTicket",
                        params: { schedule: selectedTab },
                      })
                    }
                  >
                    <View style={styles.purchasedBannerRight}>
                      <Text style={styles.viewTicketText}>Ver ticket</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          handleIndicatorStyle={{ backgroundColor: theme.border, width: 40 }}
          backgroundStyle={{
            borderRadius: 32,
            backgroundColor: theme.surface,
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIconBox}>
                <ShoppingCart size={24} color={theme.textPrimary} />
              </View>
              <Text style={styles.sheetTitle}>Confirmar Pedido</Text>
              <TouchableOpacity onPress={handleDismissModal} style={styles.closeBtn}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.orderSummary}>
                <Text style={styles.summaryLabel}>Servicio</Text>
                <Text style={styles.summaryValue}>{selectedTab}</Text>
              </View>
              <View style={styles.orderSummary}>
                <Text style={styles.summaryLabel}>Total a pagar</Text>
                <Text style={styles.totalValue}>${calculateTotal()}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Al confirmar, se generará un ticket digital que podrás canjear en el comedor.
                </Text>
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={handleDismissModal}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => handleBuy(user.id, selectedMenu.id)}
              >
                <Text style={styles.confirmBtnText}>Confirmar Compra</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      width: "100%",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      fontSize: 16,
      color: theme.danger,
    },
    card: {
      flex: 1,
      padding: 20,
      borderRadius: 24,
      backgroundColor: theme.surface,
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
    tabInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tabText: {
      color: theme.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
    selectedTabText: { color: "#fff" },
    purchasedDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#4CAF50",
    },
    purchasedDotActive: { backgroundColor: "#A5D6A7" },
    menuContainer: { flex: 1 },
    menuItem: { marginBottom: 4 },
    menuItemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    itemName: {
      fontSize: 17,
      color: theme.textPrimary,
      fontWeight: "500",
      flexShrink: 1,
    },
    menuItemDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 12,
    },
    itemPrice: {
      fontSize: 17,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    totalContainer: { marginTop: 8, paddingTop: 4 },
    totalDivider: {
      height: 1.5,
      backgroundColor: theme.border,
      marginBottom: 16,
    },
    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    totalLabel: {
      fontSize: 18,
      color: theme.textPrimary,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    totalAmount: {
      fontSize: 20,
      color: theme.textPrimary,
      fontWeight: "800",
    },
    buttonContainer: { marginTop: 16 },
    buyButton: {
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      backgroundColor: theme.accent,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    buyButtonText: {
      fontSize: 17,
      color: "#fff",
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    purchasedBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#4CAF50",
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 16,
      shadowColor: "#4CAF50",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    purchasedBannerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    purchasedBannerText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "40%",
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    emptyText: {
      textAlign: "center",
      fontSize: 18,
      color: theme.textPrimary,
      fontWeight: "600",
      marginBottom: 6,
    },
    emptySubText: {
      textAlign: "center",
      fontSize: 14,
      color: theme.textSecondary,
    },
    purchasedBannerRight: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    viewTicketText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    // Bottom sheet (uses theme)
    sheetContent: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 20,
      flex: 1,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    sheetIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.textPrimary,
      flex: 1,
    },
    closeBtn: { padding: 8 },
    sheetBody: { marginBottom: 32 },
    orderSummary: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    summaryLabel: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 16,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    totalValue: {
      fontSize: 22,
      color: theme.textPrimary,
      fontWeight: "900",
    },
    infoBox: {
      marginTop: 20,
      padding: 16,
      backgroundColor: theme.surfaceSecondary,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    sheetFooter: {
      flexDirection: "row",
      gap: 12,
      marginTop: "auto",
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtn: { backgroundColor: theme.background },
    confirmBtn: { backgroundColor: theme.primary },
    cancelBtnText: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    confirmBtnText: { fontSize: 16, color: "#fff", fontWeight: "700" },
  });
}

export default MenuScreen;
