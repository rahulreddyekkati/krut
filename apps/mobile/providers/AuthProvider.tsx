import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { getToken, saveToken, deleteToken } from "../utils/tokenManager";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});


interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextData {
  isLoading: boolean;
  token: string | null;
  user: UserInfo | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

function decodeJwtPayload(token: string): UserInfo | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.user) {
      return {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        role: payload.user.role,
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useMemo(() => {
    if (!token) return null;
    return decodeJwtPayload(token);
  }, [token]);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await getToken();
        setToken(storedToken);
        if (storedToken) {
          registerPushToken(storedToken).catch(() => {});
        }
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const signIn = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    registerPushToken(newToken).catch(() => {});
  };

  const signOut = async () => {
    await deleteToken();
    setToken(null);
  };

  const registerPushToken = async (authToken: string) => {
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    const { status } = existing === "granted"
      ? { status: existing }
      : await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const pushToken = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "74b77b94-ceb2-4183-8b7e-245c768aeee3",
      })
    ).data;

    const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL;
    await fetch(`${apiBase}/users/push-token`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
