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
    const body = document.body;

    const applyTheme = (el: HTMLElement) => {
      el.classList.remove(...THEME_CLASSES);
      if (resolved === "dark") {
        el.classList.add("dark");
      } else {
        el.classList.add("light");
      }
      el.setAttribute("data-theme", resolved);
      el.style.colorScheme = resolved === "dark" ? "dark" : "light";
    };

    applyTheme(root);
    applyTheme(body);

    root.setAttribute("dir", "rtl");
  }, [resolved]);

  return <>{children}</>;
}

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);
  return { theme, setTheme };
}
