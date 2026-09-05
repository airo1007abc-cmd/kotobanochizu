/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLICATION_MODE?: "preview" | "production";
  readonly VITE_OPERATOR_NAME?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
