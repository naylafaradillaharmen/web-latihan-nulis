"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  getIdToken: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing token on initial load
  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("inkly_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("inkly_token");
          setUser(null);
        }
      } catch (err) {
        console.warn("Gagal memuat status login pengguna:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password, rememberDevice = true) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal masuk. Periksa email dan passphrase.");
    }

    if (data.token) {
      localStorage.setItem("inkly_token", data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, displayName = "") => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mendaftar.");
    }

    if (data.token) {
      localStorage.setItem("inkly_token", data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    localStorage.removeItem("inkly_token");
    localStorage.removeItem("inkly_remember_device");
    setUser(null);
  };

  const resetPassword = async (email) => {
    // Karena menggunakan SQLite lokal di komputer sendiri
    throw new Error(
      "Database lokal SQLite aktif. Anda dapat langsung mendaftarkan akun baru atau membuat passphrase baru kapan saja tanpa perlu verifikasi email."
    );
  };

  const getIdToken = async () => {
    return localStorage.getItem("inkly_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
