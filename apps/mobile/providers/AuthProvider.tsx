import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getToken, saveToken, deleteToken } from "../utils/tokenManager";


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
  };

  const signOut = async () => {
    await deleteToken();
    setToken(null);
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
