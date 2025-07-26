/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PROGRAMID: `0x${string}`;
    readonly VITE_BACKEND: string;
 
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
