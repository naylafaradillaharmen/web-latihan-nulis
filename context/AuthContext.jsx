"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";

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

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, rememberDevice = true) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    try {
      const persistence = rememberDevice
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (persistErr) {
      console.warn("Could not set auth persistence:", persistErr);
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, displayName = "") => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (persistErr) {
      console.warn("Could not set auth persistence:", persistErr);
    }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  };

  const logout = async () => {
    if (!auth) return;
    localStorage.removeItem("inkly_remember_device");
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    return await sendPasswordResetEmail(auth, email);
  };

  const getIdToken = async (forceRefresh = false) => {
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
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
