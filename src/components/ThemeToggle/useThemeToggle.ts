import { useTheme } from "next-themes";

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return { toggle: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") };
}
