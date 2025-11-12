import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type UserRole = "admin" | "user" | "support";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatar?: string;
}

const storage =
	typeof window !== "undefined"
		? createJSONStorage<User | null>(() => window.localStorage)
		: undefined;

export const userAtom = atomWithStorage<User | null>(
	"support-user",
	null,
	storage,
);

export const isAuthenticatedAtom = atom((get) => {
	const user = get(userAtom);
	return user !== null;
});

export const isAdminAtom = atom((get) => {
	const user = get(userAtom);
	return user?.role === "admin";
});

export const isUserAtom = atom((get) => {
	const user = get(userAtom);
	return user?.role === "user";
});
