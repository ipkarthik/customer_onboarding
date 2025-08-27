"use client";

import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#1976d2" },
                background: { default: "#fafafa" },
              }
            : {
                primary: { main: "#90caf9" },
                background: { default: "#121212" },
              }),
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeToggle mode={mode} setMode={setMode} />
      {children}
    </ThemeProvider>
  );
}

function ThemeToggle({ mode, setMode }: { mode: "light" | "dark"; setMode: (m: "light" | "dark") => void }) {
  return (
    <button
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      {mode === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
