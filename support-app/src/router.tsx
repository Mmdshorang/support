import type { RegisteredRouter } from "@tanstack/react-router";
import { atom, getDefaultStore } from "jotai";

export const routerAtom = atom<RegisteredRouter>(
	undefined as any as RegisteredRouter,
);

export const getRouter = () => getDefaultStore().get(routerAtom);
