import { useAtom, useAtomValue } from "jotai";
import { type PropsWithChildren, useEffect } from "react";
import { resolvedThemeAtom, themeAtom, type Theme } from "../../stores/theme";

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: Theme;
  storageKey?: string;
}>;

const THEME_CLASSES: Array<Exclude<Theme, "system">> = [
  "light",
  "dark",
  "test",
];

export function ThemeProvider({ children }: ThemeProviderProps) {
  const resolved = useAtomValue(resolvedThemeAtom);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove(...THEME_CLASSES);

    root.classList.add(resolved);

    root.setAttribute("dir", "rtl");
  }, [resolved]);

  return <>{children}</>;
}

export function UseTheme() {
  const [theme, setTheme] = useAtom(themeAtom);
  return { theme, setTheme };
}
