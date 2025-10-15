import { Stack } from "expo-router";


export default function InventoryLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="tickets"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}