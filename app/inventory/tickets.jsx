import { View, StyleSheet } from "react-native";
import Tickets from "@/components/views/admin/tickets";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Inventory() {

    return (
        <SafeAreaView style={styles.container}>
            <Tickets />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e3e3e3ff",
        justifyContent: "center",
        alignItems: "center",
    },
});
