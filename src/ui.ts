import { state } from './state';
import type { Region, Provider } from './types';
import * as globe from './globe';

const PROVIDER_DOC_LINKS: Record<Provider, (name: string) => string> = {
  AWS: name =>
    `https://aws.amazon.com/about-aws/global-infrastructure/regions_az/?nc2=type_a#AWS_Global_Infrastructure_Map`,
  Google: name => `https://cloud.google.com/about/locations#${name.toLowerCase().replace(/\s+/g, '-')}`,
  Azure: name => `https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/`,
};

export function initUI(): void {
  document.getElementById('cloudProviderSelect')!.addEventListener('change', e => {
    const value = (e.target as HTMLSelectElement).value;
      globe.loadProviderData(value);
    resetCheckboxes();
    updateStats();
    toggleAllProviderLegend(value === 'all');
  });

  document.getElementById('nameDisplaySelect')!.addEventListener('change', () => {
    state.isLongName = !state.isLongName;
    globe.updateActiveGlobe();
  });

  document.getElementById('localZonesCheckbox')!.addEventListener('change', () => {
    state.showLocalZones = !state.showLocalZones;
    globe.updateActiveGlobe();
    updateStats();
  });

  document.getElementById('popCheckbox')!.addEventListener('change', () => {
    state.showPoPs = !state.showPoPs;
    globe.updateActiveGlobe();
    updateStats();
  });

  document.getElementById('cables')!.addEventListener('change', () => {
    state.showCables = !state.showCables;
    globe.updateActiveGlobe();
  });

  // Region click handler
  globe.setOnRegionClick((region: Region, provider: Provider) => {
    state.selectedRegion = { ...region, provider };
    showInfoPanel(region, provider);
    globe.showLatencyArcs(region, provider);
  });

  // Info panel close
  document.getElementById('infoPanelClose')!.addEventListener('click', () => {
    hideInfoPanel();
    state.selectedRegion = null;
    globe.clearLatencyArcs();
  });

  // Search input
  const searchInput = document.getElementById('regionSearch') as HTMLInputElement;
  const searchResults = document.getElementById('searchResults')!;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }

    const regions = globe.getAllRegions();
    const matches = regions.filter(
      r =>
        r.name.toLowerCase().includes(query) ||
        r.longName.toLowerCase().includes(query),
    ).slice(0, 8);

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item">No results</div>';
      searchResults.style.display = 'block';
      return;
    }

    searchResults.innerHTML = matches
      .map(
        r => `<div class="search-result-item" data-lat="${r.lat}" data-lng="${r.lng}"
          data-provider="${r.provider}">
          <span class="search-dot" style="background:${providerBadgeColor(r.provider)}"></span>
          ${r.longName} <span class="search-code">${r.name}</span>
        </div>`,
      )
      .join('');
    searchResults.style.display = 'block';

    searchResults.querySelectorAll<HTMLElement>('.search-result-item[data-lat]').forEach(el => {
      el.addEventListener('click', () => {
        const lat = parseFloat(el.dataset.lat!);
        const lng = parseFloat(el.dataset.lng!);
        globe.flyToRegion(lat, lng);
        searchInput.value = '';
        searchResults.style.display = 'none';
      });
    });
  });

  document.addEventListener('click', e => {
    if (!(e.target as HTMLElement).closest('#searchWrapper')) {
      searchResults.style.display = 'none';
    }
  });

  updateStats();
}

function providerBadgeColor(provider: Provider): string {
  return { AWS: '#FF9900', Google: '#4285F4', Azure: '#0078d4' }[provider];
}

function showInfoPanel(region: Region, provider: Provider): void {
  const panel = document.getElementById('infoPanel')!;
  document.getElementById('infoPanelProvider')!.textContent = provider;
  document.getElementById('infoPanelProvider')!.style.color = providerBadgeColor(provider);
  document.getElementById('infoPanelName')!.textContent = region.longName;
  document.getElementById('infoPanelCode')!.textContent = region.name;
  document.getElementById('infoPanelType')!.textContent = region.type;
  document.getElementById('infoPanelStatus')!.textContent = region.status;
  document.getElementById('infoPanelCoords')!.textContent =
    `${region.lat.toFixed(3)}°, ${region.lng.toFixed(3)}°`;
  const link = document.getElementById('infoPanelLink') as HTMLAnchorElement;
  link.href = PROVIDER_DOC_LINKS[provider](region.name);
  panel.style.display = 'block';
}

function hideInfoPanel(): void {
  document.getElementById('infoPanel')!.style.display = 'none';
}

function toggleAllProviderLegend(show: boolean): void {
  const legend = document.getElementById('allProviderLegend')!;
  const singleLegend = document.getElementById('singleProviderLegend')!;
  legend.style.display = show ? 'block' : 'none';
  singleLegend.style.display = show ? 'none' : 'block';
  // hide controls that don't apply in all-providers mode
  const nameDisplay = document.getElementById('nameDisplayToggle') as HTMLElement;
  if (nameDisplay) nameDisplay.style.display = show ? 'none' : 'flex';
}

function updateStats(): void {
  const el = document.getElementById('regionStats');
  if (!el) return;
  const counts = globe.getRegionCounts();
  if (state.showAllProviders) {
    el.innerHTML = `
      <span style="color:#FF9900">AWS ${counts.AWS}</span> &nbsp;
      <span style="color:#4285F4">GCP ${counts.Google}</span> &nbsp;
      <span style="color:#0078d4">Azure ${counts.Azure}</span>
    `;
  } else {
    const p = state.selectedProvider;
    el.innerHTML = `<span style="color:${providerBadgeColor(p)}">${p} ${counts[p]} regions</span>`;
  }
}

function resetCheckboxes(): void {
  (document.getElementById('localZonesCheckbox') as HTMLInputElement).checked = false;
  (document.getElementById('popCheckbox') as HTMLInputElement).checked = false;
  (document.getElementById('cables') as HTMLInputElement).checked = false;
  (document.getElementById('nameDisplaySelect') as HTMLSelectElement).value = 'longName';
}
