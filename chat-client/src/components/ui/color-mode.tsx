"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ColorMode = "light" | "dark";

interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(
  undefined
);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  useEffect(() => {
    const savedColorMode = localStorage.getItem("colorMode") as ColorMode;
    if (savedColorMode) {
      setColorMode(savedColorMode);
      document.documentElement.classList.toggle(
        "dark",
        savedColorMode === "dark"
      );
    }
  }, []);

  const toggleColorMode = () => {
    const newColorMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newColorMode);
    localStorage.setItem("colorMode", newColorMode);
    document.documentElement.classList.toggle("dark", newColorMode === "dark");
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}

export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? lightValue : darkValue;
}
