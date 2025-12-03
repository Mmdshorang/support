import { createRouter } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// import { ErrorPage } from "./components/auth/auth";
// import { BackgroundContainer } from "./components/base";
import { routeTree } from "./routeTree.gen";
import { routerAtom } from "./router";
import { registerSW } from "virtual:pwa-register";

export const router = createRouter({
  routeTree: routeTree,
  // defaultPendingComponent: () => <BackgroundContainer />,
  // defaultErrorComponent: ErrorPage,
  // defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
getDefaultStore().set(routerAtom, router); // HMR Hack

console.info("Main rendered");
// Register service worker for PWA with update handlers
const updateServiceWorker = registerSW({
  onRegistered(r?: ServiceWorkerRegistration | undefined) {
    console.info("Service worker registered:", r);
  },
  onRegisterError(err?: unknown) {
    console.error("SW registration error:", err);
  },
  onNeedRefresh() {
    // A new version is available — prompt the user to update
    // Very simple UX: ask to reload now
    if (
      confirm(
        "نسخه جدید آماده است. صفحه را بازنشانی کنم تا به‌روزرسانی اعمال شود؟"
      )
    ) {
      updateServiceWorker(true);
    }
  },
  onOfflineReady() {
    console.info("App is ready to work offline");
  },
});
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
