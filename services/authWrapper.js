import { useRootNavigationState, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!user && navigationState.key) {
      router.push("/login");
      console.log("User not logged");
    } else if (user) {
      router.push("/home");
    }
  }, [user, dispatch]);

  console.log("User from auth: ", user);
  return children;
}
