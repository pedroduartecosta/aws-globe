import { state } from './state';
import { loadProviderData, updateActiveGlobe } from './globe';

export function initUI(): void {
  document.getElementById('cloudProviderSelect')!.addEventListener('change', e => {
    const value = (e.target as HTMLSelectElement).value;
    loadProviderData(value);
    resetCheckboxes();
  });

  document.getElementById('nameDisplaySelect')!.addEventListener('change', () => {
    state.isLongName = !state.isLongName;
    updateActiveGlobe();
  });

  document.getElementById('localZonesCheckbox')!.addEventListener('change', () => {
    state.showLocalZones = !state.showLocalZones;
    updateActiveGlobe();
  });

  document.getElementById('popCheckbox')!.addEventListener('change', () => {
    state.showPoPs = !state.showPoPs;
    updateActiveGlobe();
  });

  document.getElementById('cables')!.addEventListener('change', () => {
    state.showCables = !state.showCables;
    updateActiveGlobe();
  });
}

function resetCheckboxes(): void {
  (document.getElementById('localZonesCheckbox') as HTMLInputElement).checked = false;
  (document.getElementById('popCheckbox') as HTMLInputElement).checked = false;
  (document.getElementById('cables') as HTMLInputElement).checked = false;
  (document.getElementById('nameDisplaySelect') as HTMLSelectElement).value = 'longName';
}
