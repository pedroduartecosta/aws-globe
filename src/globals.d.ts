declare module 'three-globe' {
  import { Object3D } from 'three';
  class ThreeGlobe extends Object3D {
    constructor(options?: { waitForGlobeReady?: boolean; animateIn?: boolean });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  export default ThreeGlobe;
}
