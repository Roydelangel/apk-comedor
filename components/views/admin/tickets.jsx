import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosInstance from "@/services/axiosInstance";
import { useTheme } from "@/context/ThemeContext";

const SCHEDULE_COLORS = {
  Desayuno: "#e8a838",
  Almuerzo: "#3a6ea5",
  Comida: "#4caf50",
};

export default function TicketsInventory() {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterToday, setFilterToday] = useState(true);

  const styles = makeStyles(theme);

  const fetchTickets = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true);
        setError(null);
      }
      try {
        const dateParam = filterToday ? "?date=today" : "";
        const response = await axiosInstance.get(`/tickets${dateParam}`);
        const data = response.data;
        if (reset) {
          setTickets(data.results || []);
        } else {
          setTickets((prev) => [...prev, ...(data.results || [])]);
        }
        setNextUrl(data.next || null);
      } catch (err) {
        setError(
          err.response?.data?.error?.detail ||
            err.response?.data?.detail ||
            "Error al cargar los tickets"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filterToday]
  );

  useEffect(() => {
    fetchTickets(true);
  }, [fetchTickets]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets(true);
  };

  const handleLoadMore = async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await axiosInstance.get(nextUrl);
      const data = response.data;
      setTickets((prev) => [...prev, ...(data.results || [])]);
      setNextUrl(data.next || null);
    } catch (_) {
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const userId = (t.user ?? "").toString().toLowerCase();
    const schedule = (t.menu?.schedule ?? "").toLowerCase();
    const query = searchText.toLowerCase();
    return userId.includes(query) || schedule.includes(query);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const renderTicket = ({ item }) => {
    const scheduleColor = SCHEDULE_COLORS[item.menu?.schedule] || "#666";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.scheduleBadge, { backgroundColor: scheduleColor }]}>
            <Text style={styles.scheduleBadgeText}>{item.menu?.schedule ?? "—"}</Text>
          </View>
          <View style={[styles.statusBadge, item.used ? styles.statusUsed : styles.statusUnused]}>
            <MaterialCommunityIcons
              name={item.used ? "check-circle" : "clock-outline"}
              size={12}
              color={item.used ? "#2e7d32" : "#b45309"}
            />
            <Text style={[styles.statusText, item.used ? styles.statusUsedText : styles.statusUnusedText]}>
              {item.used ? "Usado" : "Sin usar"}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={16} color={theme.textSecondary} />
            <Text style={styles.infoLabel}>Usuario:</Text>
            <Text style={styles.infoValue}>{item.user ?? "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.textSecondary} />
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cash" size={16} color={theme.textSecondary} />
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.infoValue}>
              ${parseFloat(item.menu?.total_price ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar por usuario o turno..."
          placeholderTextColor={theme.textPlaceholder}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <MaterialCommunityIcons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterToday && styles.filterBtnActive]}
          onPress={() => setFilterToday(true)}
        >
          <Text style={[styles.filterBtnText, filterToday && styles.filterBtnTextActive]}>
            Hoy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, !filterToday && styles.filterBtnActive]}
          onPress={() => setFilterToday(false)}
        >
          <Text style={[styles.filterBtnText, !filterToday && styles.filterBtnTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
      </View>

      {!loading && !error && (
        <Text style={styles.counter}>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
        </Text>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando tickets...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#c62828" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTickets(true)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={theme.primary}
                style={{ marginVertical: 12 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <MaterialCommunityIcons name="ticket-outline" size={48} color={theme.textSecondary} />
              <Text style={styles.noResults}>No se encontraron tickets.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.background,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 10,
      elevation: 2,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.08,
      shadowRadius: 3,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.textPrimary,
    },
    filterRow: { flexDirection: "row", marginBottom: 8, gap: 8 },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    filterBtnActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterBtnText: { fontSize: 13, color: theme.textSecondary },
    filterBtnTextActive: { color: "#fff", fontWeight: "600" },
    counter: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
      marginLeft: 2,
    },
    listContainer: { paddingBottom: 24 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 10,
      overflow: "hidden",
      elevation: 2,
      shadowColor: theme.headerShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.08,
      shadowRadius: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    scheduleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    scheduleBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    statusUsed: { backgroundColor: "#e8f5e9" },
    statusUnused: { backgroundColor: "#fff8e1" },
    statusText: { fontSize: 12, fontWeight: "600" },
    statusUsedText: { color: "#2e7d32" },
    statusUnusedText: { color: "#b45309" },
    cardBody: { padding: 14, gap: 6 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    infoLabel: { fontSize: 13, color: theme.textSecondary, width: 70 },
    infoValue: { fontSize: 13, color: theme.textPrimary, fontWeight: "600", flex: 1 },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    loadingText: { color: theme.textSecondary, marginTop: 8 },
    errorText: { color: "#c62828", textAlign: "center", fontSize: 14 },
    retryBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryText: { color: "#fff", fontWeight: "600" },
    noResults: { fontSize: 15, color: theme.textSecondary, marginTop: 4 },
  });
}