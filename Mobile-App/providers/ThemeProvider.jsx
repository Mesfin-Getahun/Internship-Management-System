import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();

  const value = useMemo(
    () => ({
      theme: colorScheme || "light",
      isDark: colorScheme === "dark",
      setTheme: setColorScheme,
      toggleTheme: toggleColorScheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={value.isDark ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
