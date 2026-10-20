"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useThemeToggle } from "@/components/ThemeToggle/useThemeToggle";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const theme = useThemeToggle();
  return (
    <Button variant="ghost" size="icon-touch" aria-label="Switch light or dark mode" onClick={theme.toggle}>
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  );
}
