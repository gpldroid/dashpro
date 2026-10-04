"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";

type Direction = "rtl" | "ltr";
type DirectionContextValue = {
  direction: Direction;
  toggleDirection: () => void;
};

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);
let currentDirection: Direction = "rtl";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Direction {
  return currentDirection;
}

function getServerSnapshot(): Direction {
  return "rtl";
}

function applyDirection(nextDirection: Direction) {
  currentDirection = nextDirection;
  if (typeof document !== "undefined") {
    document.documentElement.dir = nextDirection;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem("dashpro-direction", nextDirection);
  }
  listeners.forEach((listener) => listener());
}

export function DirectionProvider({ children }: { children: ReactNode }) {
  const direction = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("dashpro-direction");
    applyDirection(stored === "ltr" ? "ltr" : "rtl");
  }, []);

  const toggleDirection = useCallback(() => {
    applyDirection(currentDirection === "rtl" ? "ltr" : "rtl");
  }, []);

  const value = useMemo(
    () => ({ direction, toggleDirection }),
    [direction, toggleDirection]
  );

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used inside a DirectionProvider.");
  }
  return context;
}
