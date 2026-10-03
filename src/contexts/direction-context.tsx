"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

type Direction = "rtl" | "ltr";
type DirectionContextValue = {
  direction: Direction;
  toggleDirection: () => void;
};

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

export function DirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<Direction>("rtl");

  useEffect(() => {
    const stored = window.localStorage.getItem("dashpro-direction");
    if (stored === "rtl" || stored === "ltr") setDirection(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = direction;
    window.localStorage.setItem("dashpro-direction", direction);
  }, [direction]);

  const toggleDirection = useCallback(() => {
    setDirection((current) => (current === "rtl" ? "ltr" : "rtl"));
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
