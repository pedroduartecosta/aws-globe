import ThreeGlobe from 'three-globe';
import { Color, OctahedronGeometry, MeshLambertMaterial, Mesh, Raycaster, Vector2 } from 'three';
import * as satellite from 'satellite.js';
import countries from './files/globe-data-min.json';
import awsRegionsData from './files/regions-data-aws.json';
import googleRegionsData from './files/regions-data-google.json';
import azureRegionsData from './files/regions-data-azure.json';
import labelfont from '../assets/src/files/helvetiker_bold.typeface.json';
import tleData from './data/satellites-tle';
import { scene, camera, controls, renderer } from './scene';
import { state, cablePaths } from './state';
import type { Region, RegionsCollection, Provider } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGlobe = any;

let GlobeRegionsAWS: AnyGlobe;
let GlobeRegionsGoogle: AnyGlobe;
let GlobeRegionsAzure: AnyGlobe;

const EARTH_RADIUS_KM = 6371;
const SAT_SIZE = 80;
const TIME_STEP = 0.5 * 1000;

const providerData: Record<Provider, RegionsCollection> = {
  AWS: awsRegionsData as unknown as RegionsCollection,
  Google: googleRegionsData as unknown as RegionsCollection,
  Azure: azureRegionsData as unknown as RegionsCollection,
};

const PROVIDER_COLORS: Record<Provider, string> = {
  AWS: '#FF9900',
  Google: '#4285F4',
  Azure: '#0078d4',
};

let onRegionClick: ((region: Region, provider: Provider) => void) | null = null;

export function setOnRegionClick(fn: (region: Region, provider: Provider) => void): void {
  onRegionClick = fn;
}

function regionColor(e: Region): string {
  if (e.type === 'Region') return e.status === 'available' ? '#f1f3f3' : '#ff6633';
  if (e.type === 'Local Zone') return '#ffee53';
  if (e.type === 'PoP') return '#337aff';
  return '#ff6633';
}

function regionColorForProvider(provider: Provider) {
  return (e: Region): string => {
    if (e.status !== 'available') return '#666666';
    return PROVIDER_COLORS[provider];
  };
}

function regionDotRadius(e: Region): number {
  if (e.type === 'Region') return 1;
  if (e.type === 'Local Zone') return 0.5;
  if (e.type === 'PoP') return 0.4;
  return 0;
}

function regionLabelSize(e: Region): number {
  if (e.type === 'Region') return 1.2;
  if (e.type === 'Local Zone') return 0.8;
  if (e.type === 'PoP') return 0.7;
  return 0;
}

function regionAltitude(e: Region): number {
  if (e.type === 'Region') return 0.02;
  if (e.type === 'Local Zone') return 0.01;
  if (e.type === 'PoP') return 0.005;
  return 0;
}

function filterRegions(regions: Region[]): Region[] {
  return regions.filter(
    e =>
      e.type === 'Region' ||
      (state.showLocalZones && e.type === 'Local Zone') ||
      (state.showPoPs && e.type === 'PoP'),
  );
}

export function updateGlobe(globe: AnyGlobe, regionsData: RegionsCollection, provider?: Provider): void {
  const filtered = filterRegions(regionsData.regions);
  const labeled = filtered.map(e => ({ ...e, name: state.isLongName ? e.longName : e.name }));
  const colorFn = state.showAllProviders && provider ? regionColorForProvider(provider) : regionColor;

  globe
    .labelsData(labeled)
    .labelsTransitionDuration(0)
    .labelColor(colorFn)
    .labelDotRadius(regionDotRadius)
    .labelSize(state.showAllProviders ? 0 : regionLabelSize)
    .labelText((e: Region) => (state.showAllProviders ? '' : state.isLongName ? e.longName : e.name))
    .labelResolution(6)
    .labelAltitude(regionAltitude)
    .labelDotOrientation((e: Region) => (e.type === 'Region' ? 'right' : 'left'))
    .labelTypeFace(labelfont)
    .pointsData(filtered.filter(e => e.type === 'Region'))
    .pointColor(colorFn)
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(0.05)
    .pathsData(state.showCables && !state.showAllProviders ? cablePaths : []);
}

function initSatellites(globe: AnyGlobe): void {
  const satGeometry = new OctahedronGeometry((SAT_SIZE * 100) / EARTH_RADIUS_KM / 2, 0);
  const satMaterial = new MeshLambertMaterial({ color: 'palegreen', transparent: true, opacity: 0.3 });
  globe.objectThreeObject(() => new Mesh(satGeometry, satMaterial));

  const parsed = tleData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const satData: any[] = parsed.map(([name, ...tle]) => ({
    satrec: satellite.twoline2satrec(tle[0], tle[1]),
    name: name.trim().replace(/^0 /, ''),
  }));

  let time = new Date();
  (function frameTicker() {
    requestAnimationFrame(frameTicker);
    time = new Date(+time + TIME_STEP);
    const gmst = satellite.gstime(time);
    satData.forEach(d => {
      const eci = satellite.propagate(d.satrec, time);
      if (eci && eci.position && typeof eci.position !== 'boolean') {
        const gdPos = satellite.eciToGeodetic(eci.position as satellite.EciVec3<number>, gmst);
        d.lat = satellite.radiansToDegrees(gdPos.latitude);
        d.lng = satellite.radiansToDegrees(gdPos.longitude);
        d.alt = 1;
      }
    });
    globe.objectsData(satData);
  })();
}

function buildGlobe(regionsData: RegionsCollection, provider: Provider): AnyGlobe {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true }) as any;

  globe
    .hexPolygonsData((countries as { features: unknown[] }).features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .objectLat('lat')
    .objectLng('lng')
    .objectAltitude('alt')
    .objectFacesSurface(false)
    .showAtmosphere(true)
    .atmosphereColor('#232F3E')
    .atmosphereAltitude(0.25)
    .hexPolygonColor(() => 'rgba(255,153,0, 0.8)')
    .pathsData([])
    .pathPoints('coords')
    .pathColor(() => '#abbbd4')
    .pathDashLength(0.2)
    .pathStroke(0.5)
    .pathDashGap(0.008)
    .pathDashAnimateTime(24000)
    .pathPointLat((p: number[]) => p[1])
    .pathPointLng((p: number[]) => p[0]);

  updateGlobe(globe, regionsData, provider);
  initSatellites(globe);

  const mat = globe.globeMaterial();
  mat.color = new Color(0x232F3E);
  mat.emissive = new Color(0x232F3E);
  mat.emissiveIntensity = 0.1;
  mat.shininess = 0.7;

  return globe;
}

function initClickHandler(): void {
  const raycaster = new Raycaster();
  let mouseDownPos = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', e => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener('click', e => {
    const dx = Math.abs(e.clientX - mouseDownPos.x);
    const dy = Math.abs(e.clientY - mouseDownPos.y);
    if (dx > 5 || dy > 5) return;

    const mouse = new Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (const { object } of intersects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let obj: any = object;
      while (obj) {
        if (obj.__globeObjType === 'label' && obj.__data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let root: any = obj;
          while (root.parent && root.parent !== scene) root = root.parent;
          const provider: Provider | null =
            root === GlobeRegionsAWS
              ? 'AWS'
              : root === GlobeRegionsGoogle
                ? 'Google'
                : root === GlobeRegionsAzure
                  ? 'Azure'
                  : null;
          if (provider && onRegionClick) {
            onRegionClick(obj.__data as Region, provider);
          }
          return;
        }
        obj = obj.parent;
      }
    }
  });
}

export function initGlobes(): void {
  if (GlobeRegionsAWS) return;

  GlobeRegionsAWS = buildGlobe(providerData.AWS, 'AWS');
  GlobeRegionsGoogle = buildGlobe(providerData.Google, 'Google');
  GlobeRegionsAzure = buildGlobe(providerData.Azure, 'Azure');

  scene.add(GlobeRegionsAWS);
  initClickHandler();
}

export function loadProviderData(provider: string): void {
  state.isLongName = true;
  state.showLocalZones = false;
  state.showPoPs = false;
  state.showCables = false;
  state.showAllProviders = false;

  scene.remove(GlobeRegionsAWS);
  scene.remove(GlobeRegionsGoogle);
  scene.remove(GlobeRegionsAzure);

  if (provider === 'all') {
    state.showAllProviders = true;
    scene.add(GlobeRegionsAWS);
    scene.add(GlobeRegionsGoogle);
    scene.add(GlobeRegionsAzure);
    updateGlobe(GlobeRegionsAWS, providerData.AWS, 'AWS');
    updateGlobe(GlobeRegionsGoogle, providerData.Google, 'Google');
    updateGlobe(GlobeRegionsAzure, providerData.Azure, 'Azure');
  } else if (provider === 'aws') {
    scene.add(GlobeRegionsAWS);
    state.selectedProvider = 'AWS';
    updateGlobe(GlobeRegionsAWS, providerData.AWS, 'AWS');
  } else if (provider === 'google') {
    scene.add(GlobeRegionsGoogle);
    state.selectedProvider = 'Google';
    updateGlobe(GlobeRegionsGoogle, providerData.Google, 'Google');
  } else if (provider === 'azure') {
    scene.add(GlobeRegionsAzure);
    state.selectedProvider = 'Azure';
    updateGlobe(GlobeRegionsAzure, providerData.Azure, 'Azure');
  }
}

export function updateActiveGlobe(): void {
  if (state.showAllProviders) {
    updateGlobe(GlobeRegionsAWS, providerData.AWS, 'AWS');
    updateGlobe(GlobeRegionsGoogle, providerData.Google, 'Google');
    updateGlobe(GlobeRegionsAzure, providerData.Azure, 'Azure');
    return;
  }
  const globe =
    state.selectedProvider === 'AWS'
      ? GlobeRegionsAWS
      : state.selectedProvider === 'Google'
        ? GlobeRegionsGoogle
        : GlobeRegionsAzure;

  updateGlobe(globe, providerData[state.selectedProvider], state.selectedProvider);
}

export function getAllRegions(): Array<Region & { provider: Provider }> {
  const providers: Provider[] = state.showAllProviders
    ? ['AWS', 'Google', 'Azure']
    : [state.selectedProvider];

  return providers.flatMap(p =>
    filterRegions(providerData[p].regions).map(r => ({ ...r, provider: p })),
  );
}

export function getRegionCounts(): Record<Provider, number> {
  return {
    AWS: filterRegions(providerData.AWS.regions).filter(r => r.type === 'Region').length,
    Google: filterRegions(providerData.Google.regions).filter(r => r.type === 'Region').length,
    Azure: filterRegions(providerData.Azure.regions).filter(r => r.type === 'Region').length,
  };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceToLatencyMs(km: number): number {
  // Fiber ~200k km/s + ~40% overhead + 10ms base
  return Math.round(km / 140 + 10);
}

function latencyColor(ms: number): string {
  if (ms < 50) return 'rgba(0,230,120,0.8)';
  if (ms < 100) return 'rgba(255,220,0,0.8)';
  if (ms < 200) return 'rgba(255,140,0,0.8)';
  return 'rgba(220,50,50,0.8)';
}

function activeGlobe(): AnyGlobe {
  if (state.selectedProvider === 'Google') return GlobeRegionsGoogle;
  if (state.selectedProvider === 'Azure') return GlobeRegionsAzure;
  return GlobeRegionsAWS;
}

export function showLatencyArcs(origin: Region, provider: Provider): void {
  const targets = providerData[provider].regions.filter(
    r => r.type === 'Region' && r.status === 'available' && r !== origin,
  );

  const arcs = targets.map(target => {
    const km = haversineKm(origin.lat, origin.lng, target.lat, target.lng);
    const ms = distanceToLatencyMs(km);
    return {
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: target.lat,
      endLng: target.lng,
      color: latencyColor(ms),
      label: `${target.longName}: ~${ms} ms`,
      alt: Math.min(km / 20000, 0.5),
    };
  });

  const globe =
    provider === 'AWS' ? GlobeRegionsAWS : provider === 'Google' ? GlobeRegionsGoogle : GlobeRegionsAzure;

  globe
    .arcsData(arcs)
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor('color')
    .arcAltitude('alt')
    .arcLabel('label')
    .arcStroke(0.4)
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(2000);
}

export function clearLatencyArcs(): void {
  GlobeRegionsAWS?.arcsData([]);
  GlobeRegionsGoogle?.arcsData([]);
  GlobeRegionsAzure?.arcsData([]);
}

export function flyToRegion(lat: number, lng: number): void {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const distance = 220;

  const targetX = distance * Math.sin(phi) * Math.cos(theta);
  const targetY = distance * Math.cos(phi);
  const targetZ = distance * Math.sin(phi) * Math.sin(theta);

  const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const endPos = { x: targetX, y: targetY, z: targetZ };
  const duration = 1200;
  const startTime = Date.now();

  controls.autoRotate = false;

  (function animateCamera() {
    const t = Math.min((Date.now() - startTime) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.x = startPos.x + (endPos.x - startPos.x) * eased;
    camera.position.y = startPos.y + (endPos.y - startPos.y) * eased;
    camera.position.z = startPos.z + (endPos.z - startPos.z) * eased;
    if (t < 1) requestAnimationFrame(animateCamera);
    else controls.autoRotate = true;
  })();
}
