[AWS Global Infrastructure](https://aws-globe.vercel.app/) 

## Implementation

The globe is constructed with [three-globe](https://github.com/vasturiano/three-globe), a ThreeJS data-visualization project made by [@vasturiano](https://github.com/vasturiano). Then, the scene is shaded with a dim ambient light and multiple directional lights to resemble a dreamy space environment. The globe's `MeshPhongMaterial` is also adjusted to fit the environment.
## Usage

Details:

```bash
npm start        # development build in ./dist
npm run build    # static production build in ./
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
