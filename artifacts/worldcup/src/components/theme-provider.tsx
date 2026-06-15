import { useState, useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark mode for this broadcast vibe
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
