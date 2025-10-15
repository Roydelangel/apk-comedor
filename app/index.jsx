import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Index() {
  const router = useRouter();
  const {user} = useSelector((state) => state.user);
  const isAuthenticated = !!user;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isReady, router]);

  return null;
}
