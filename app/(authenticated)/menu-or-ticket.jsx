import { useSelector } from "react-redux";
import ViewMenusScreen from "@/components/views/admin/menus";
import TicketView from "@/components/views/user/tickets";

export default function MenuOrTicketScreen() {
  const { user } = useSelector((state) => state.user);

  return <>{user?.role === "Admin" ? <ViewMenusScreen /> : <TicketView />}</>;
}