/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override Fastview SDCI API origin (no trailing slash). */
  readonly VITE_SDCI_API_BASE?: string
  /** Use same-origin `/sdci-api` proxy for health (vite preview, etc.). Dev enables proxy automatically. */
  readonly VITE_SDCI_PROXY?: string
}
