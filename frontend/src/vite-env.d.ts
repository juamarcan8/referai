// filepath: vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // Declara las variables de entorno que usas
  // Puedes agregar más variables aquí si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}