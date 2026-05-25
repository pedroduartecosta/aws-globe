import ThreeGlobe from 'three-globe';
import { Color, OctahedronGeometry, MeshLambertMaterial, Mesh } from 'three';
import * as satellite from 'satellite.js';
import countries from './files/globe-data-min.json';
import awsRegionsData from './files/regions-data-aws.json';
import googleRegionsData from './files/regions-data-google.json';
import azureRegionsData from './files/regions-data-azure.json';
import labelfont from '../assets/src/files/helvetiker_bold.typeface.json';
import tleData from './data/satellites-tle';
import { scene } from './scene';
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

function regionColor(e: Region): string {
  if (e.type === 'Region') return e.status === 'available' ? '#f1f3f3' : '#ff6633';
  if (e.type === 'Local Zone') return '#ffee53';
  if (e.type === 'PoP') return '#337aff';
  return '#ff6633';
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

export function updateGlobe(globe: AnyGlobe, regionsData: RegionsCollection): void {
  const filtered = filterRegions(regionsData.regions);
  const labeled = filtered.map(e => ({ ...e, name: state.isLongName ? e.longName : e.name }));

  globe
    .labelsData(labeled)
    .labelsTransitionDuration(0)
    .labelColor(regionColor)
    .labelDotRadius(regionDotRadius)
    .labelSize(regionLabelSize)
    .labelText((e: Region) => (state.isLongName ? e.longName : e.name))
    .labelResolution(6)
    .labelAltitude(regionAltitude)
    .labelDotOrientation((e: Region) => (e.type === 'Region' ? 'right' : 'left'))
    .labelTypeFace(labelfont)
    .pointsData(filtered.filter(e => e.type === 'Region'))
    .pointColor(regionColor)
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(0.05)
    .pathsData(state.showCables ? cablePaths : []);
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

function buildGlobe(regionsData: RegionsCollection): AnyGlobe {
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

  updateGlobe(globe, regionsData);
  initSatellites(globe);

  const mat = globe.globeMaterial();
  mat.color = new Color(0x232F3E);
  mat.emissive = new Color(0x232F3E);
  mat.emissiveIntensity = 0.1;
  mat.shininess = 0.7;

  return globe;
}

export function initGlobes(): void {
  if (GlobeRegionsAWS) return;

  GlobeRegionsAWS = buildGlobe(providerData.AWS);
  GlobeRegionsGoogle = buildGlobe(providerData.Google);
  GlobeRegionsAzure = buildGlobe(providerData.Azure);

  scene.add(GlobeRegionsAWS);
}

export function loadProviderData(provider: string): void {
  state.isLongName = true;
  state.showLocalZones = false;
  state.showPoPs = false;
  state.showCables = false;

  scene.remove(GlobeRegionsAWS);
  scene.remove(GlobeRegionsGoogle);
  scene.remove(GlobeRegionsAzure);

  if (provider === 'aws') {
    scene.add(GlobeRegionsAWS);
    state.selectedProvider = 'AWS';
  } else if (provider === 'google') {
    scene.add(GlobeRegionsGoogle);
    state.selectedProvider = 'Google';
  } else if (provider === 'azure') {
    scene.add(GlobeRegionsAzure);
    state.selectedProvider = 'Azure';
  }
}

export function updateActiveGlobe(): void {
  const globe =
    state.selectedProvider === 'AWS'
      ? GlobeRegionsAWS
      : state.selectedProvider === 'Google'
        ? GlobeRegionsGoogle
        : GlobeRegionsAzure;

  updateGlobe(globe, providerData[state.selectedProvider]);
}
