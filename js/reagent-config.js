/**
 * reagent-config.js
 * Skupna konfiguracija reagentov - souporabljajo jo forms/zaloga-reagentov.html
 * (vnos pošiljk) in nastavitve/reagenti.html (nastavitev pragov za opozorilo).
 *
 * Pragi se shranjujejo v localStorage (dokler ne obstaja backend) - uporabnik
 * jih nastavi na strani Nastavitve → Reagenti, stran Zaloga reagentov jih
 * takoj upošteva.
 */

const KNOWN_REAGENTS = [
  { name: 'Fiziološka raztopina', unit: 'paketi' },
  { name: 'Destilirana voda', unit: 'paketi' },
  { name: 'Etanol 70%', unit: 'ml' },
  { name: 'Pufer PBS', unit: 'ml' },
];

const DEFAULT_THRESHOLD_BY_UNIT = { paketi: 2, ml: 50 };
const THRESHOLDS_STORAGE_KEY = 'reagentLowStockThresholds';

function getReagentUnit(name) {
  const known = KNOWN_REAGENTS.find((r) => r.name.toLowerCase() === name.trim().toLowerCase());
  return known ? known.unit : 'ml';
}

function getAllThresholds() {
  try {
    return JSON.parse(localStorage.getItem(THRESHOLDS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function getThreshold(name, unit) {
  const thresholds = getAllThresholds();
  if (thresholds[name] !== undefined && thresholds[name] !== null && thresholds[name] !== '') {
    return Number(thresholds[name]);
  }
  return DEFAULT_THRESHOLD_BY_UNIT[unit] ?? 2;
}

function setThreshold(name, value) {
  const thresholds = getAllThresholds();
  thresholds[name] = value;
  localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds));
}
