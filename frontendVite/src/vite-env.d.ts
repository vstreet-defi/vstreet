/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="@react-three/fiber" />

declare module '*.glb' {
  const src: string;
  export default src;
}
