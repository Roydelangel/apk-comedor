import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from "react-native";




const sampleTickets = [
    { id: 1, matricula: "ABC123", horario: "Desayuno", fecha: "06-02-2025", hora: "07:34AM" },
    { id: 2, matricula: "DEF456", horario: "Desayuno", fecha: "06-02-2025", hora: "06:10AM" },
    { id: 3, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 4, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 5, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 6, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 7, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 8, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 9, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 10, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 11, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 12, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 13, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
    { id: 14, matricula: "XYZ789", horario: "Almuerzo", fecha: "06-02-2025", hora: "06:30AM" },
];




export default function TicketsInventory() {

    const [searchText, setSearchText] = useState("");

    const filteredTickets = sampleTickets.filter(ticket =>
        ticket.matricula.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderTicket = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Text style={styles.horario}>{`${item.horario}`}</Text>
            <Text style={styles.description}>{`${item.fecha}   ${item.hora}`}</Text>
            <View style={styles.infoRow}>
                <Text>Matricula: </Text>
                <Text>{`${item.matricula}`}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                placeholder={`Filtrar por matricula`}
                placeholderTextColor="#666"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />
            <FlatList
                data={filteredTickets}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderTicket}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.noResults}>No se encontraron tickets.</Text>}
            />
        </View>
    );



}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingHorizontal: 8,
        width: "100%",
        height: "100%",
    },
    searchInput: {
        backgroundColor: "#d3d3d3",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    horario: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    matricula: {
        fontSize: 14,
        marginBottom: 8,
        color: "#333",
    },
    description: {
        fontSize: 15,
        color: "#555",
    },
    noResults: {
        textAlign: "center",
        marginTop: 32,
        fontSize: 16,
        color: "#777",
    },
    infoRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});