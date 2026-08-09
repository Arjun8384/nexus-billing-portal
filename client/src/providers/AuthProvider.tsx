"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";

import type {
  LoginInput,
  User,
} from "@/types/auth";

interface AuthContextValue {
  user: User | null;

  loading: boolean;

  hydrated: boolean;

  login: (
    input: LoginInput
  ) => Promise<User>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

const STORAGE_KEY =
  "nexus_authenticated_user";

const AUTH_CHANGE_EVENT =
  "nexus-auth-change";

let clientSnapshot: User | null = null;

let snapshotInitialized = false;

function getClientSnapshot(): User | null {
  if (
    !snapshotInitialized &&
    typeof window !== "undefined"
  ) {
    const storedUser =
      sessionStorage.getItem(
        STORAGE_KEY
      );

    if (storedUser) {
      try {
        clientSnapshot =
          JSON.parse(
            storedUser
          ) as User;
      } catch {
        sessionStorage.removeItem(
          STORAGE_KEY
        );

        clientSnapshot = null;
      }
    }

    snapshotInitialized = true;
  }

  return clientSnapshot;
}

function getServerSnapshot(): User | null {
  return null;
}

function subscribe(
  callback: () => void
): () => void {
  window.addEventListener(
    AUTH_CHANGE_EVENT,
    callback
  );

  return () => {
    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      callback
    );
  };
}

function updateSnapshot(
  user: User | null
): void {
  clientSnapshot = user;

  if (user) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(user)
    );
  } else {
    sessionStorage.removeItem(
      STORAGE_KEY
    );
  }

  window.dispatchEvent(
    new Event(
      AUTH_CHANGE_EVENT
    )
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user =
  useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

const hydrated =
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  async function login(
    input: LoginInput
  ): Promise<User> {
    const loggedInUser =
      await loginService(input);

    updateSnapshot(
      loggedInUser
    );

    return loggedInUser;
  }

  async function logout(): Promise<void> {
    try {
      await logoutService();
    } finally {
      updateSnapshot(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        hydrated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}