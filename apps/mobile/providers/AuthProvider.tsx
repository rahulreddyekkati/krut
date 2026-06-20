import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { getToken, saveToken, deleteToken } from "../utils/tokenManager";
import { stopBackgroundLocationTracking } from "../tasks/locationTask";

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
    // atob may not be available on all RN versions; fall back gracefully
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);
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

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false; // no expiry set — treat as valid
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
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
        if (storedToken) {
          // Reject the token immediately if it's expired — don't wait for a 401
          if (isTokenExpired(storedToken)) {
            console.warn("[AuthProvider] Stored token is expired — clearing");
            await deleteToken();
          } else {
            setToken(storedToken);
            registerPushToken(storedToken).catch(() => {});
          }
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
    // Stop any running background location task before clearing credentials
    stopBackgroundLocationTracking().catch(() => {});
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
        "x-app-client": "mobile-app",
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
