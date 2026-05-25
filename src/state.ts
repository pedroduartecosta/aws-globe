import type { Provider, CablePath, CableCollection, Region } from './types';
import cableDataJson from './files/globe-cables-data.json';

export const state = {
  isLongName: true,
  selectedProvider: 'AWS' as Provider,
  showLocalZones: false,
  showPoPs: false,
  showCables: false,
  showAllProviders: false,
  selectedRegion: null as (Region & { provider: Provider }) | null,
};

const cableData = cableDataJson as unknown as CableCollection;

export const cablePaths: CablePath[] = [];
cableData.features.forEach(({ geometry, properties }) => {
  geometry.coordinates.forEach(coords => cablePaths.push({ coords, properties }));
});
