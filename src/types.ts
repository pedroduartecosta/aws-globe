export type RegionType = 'Region' | 'Local Zone' | 'PoP';
export type RegionStatus = 'available' | 'announced';
export type Provider = 'AWS' | 'Google' | 'Azure';

export interface Region {
  name: string;
  longName: string;
  lat: number;
  lng: number;
  type: RegionType;
  status: RegionStatus;
  azCount?: number;
}

export interface RegionsCollection {
  type: 'RegionsCollection';
  regions: Region[];
}

export interface CableGeometry {
  type: string;
  coordinates: number[][][];
}

export interface CableProperties {
  id: string;
  name: string;
  color: string;
  feature_id: string;
  coordinates: number[];
}

export interface CableFeature {
  type: 'Feature';
  geometry: CableGeometry;
  properties: CableProperties;
}

export interface CableCollection {
  type: 'FeatureCollection';
  name: string;
  features: CableFeature[];
}

export interface CablePath {
  coords: number[][];
  properties: CableProperties;
}
