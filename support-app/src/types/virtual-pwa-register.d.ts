declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onRegistered?: (registration?: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error?: unknown) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }

  /**
   * Returns a function that can be called to trigger update (skip waiting).
   * Call with `true` to immediately apply the update.
   */
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void;

  export default registerSW;
}
