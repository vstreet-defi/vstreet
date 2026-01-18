/// <reference types="react-scripts" />
declare module "*.mp4";
declare module "@react-three/fiber";
declare module "@react-three/postprocessing";

declare namespace JSX {
    interface IntrinsicElements {
        instancedMesh: any;
        boxGeometry: any;
        meshStandardMaterial: any;
        color: any;
        fog: any;
        ambientLight: any;
        pointLight: any;
        gridHelper: any;
    }
}
