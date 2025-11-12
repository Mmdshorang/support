import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type Theme = "light" | "dark" | "system" | "test";

const storage =
	typeof window !== "undefined"
		? createJSONStorage<Theme>(() => window.localStorage)
		: undefined;
export const themeAtom = atomWithStorage<Theme>("fc-ui-theme", "light", storage);

const prefersDarkAtom = atom(false);
prefersDarkAtom.onMount = (set) => {
	if (typeof window === "undefined") return;
	const mql = window.matchMedia("(prefers-color-scheme: dark)");
	set(mql.matches);
	const onChange = (e: MediaQueryListEvent) => set(e.matches);
	mql.addEventListener("change", onChange);
	return () => mql.removeEventListener("change", onChange);
};

export const resolvedThemeAtom = atom<"light" | "dark" | "test">((get) => {
	const t = get(themeAtom);
	return t === "system" ? (get(prefersDarkAtom) ? "dark" : "light") : t;
});
