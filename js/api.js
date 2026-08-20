/**
 * api.js
 * Enotna plast za komunikacijo z backendom.
 *
 * Backend še ne obstaja (SQL baza in podrobna poslovna logika bodo
 * posredovani naknadno), zato ta datoteka služi kot dogovor (kontrakt) o
 * tem, katere endpoint-e in oblike podatkov frontend pričakuje.
 *
 * Vsi klici uporabljajo Bearer token, shranjen po prijavi (glej auth.js).
 */

async function apiRequest(path, { method = 'GET', body = null, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Napaka API: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const API = {
  // --- Avtentikacija ---
  // POST /auth/login  { username, password } -> { token, user }
  login: (username, password) =>
    apiRequest('/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  // POST /auth/logout
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // --- Nadzorna plošča ---
  // GET /processes -> [{ id, mbl, name, processType, status, location, startedAt }]
  getProcesses: () => apiRequest('/processes'),

  // --- Podrobnosti procesa ---
  // GET /processes/:id -> { id, name, status, steps, assets, location, results }
  getProcess: (id) => apiRequest(`/processes/${id}`),

  // --- Preiskave (1. vnos) ---
  // GET /research -> [{ id, researchId, labId, benchId, reagent, date, signature }]
  // pacient/opis nista več tu - identiteta gre preko ID-ja (povezava na pacienti po ID-ju)
  getResearchEntries: () => apiRequest('/research'),

  // POST /research  { researchId, labId, benchId, reagent, date, signature } -> { id }
  // signature je base64 PNG iz podpisne ploščice (canvas.toDataURL())
  createResearch: (data) => apiRequest('/research', { method: 'POST', body: data }),

  // GET /laboratories -> [{ id, name }]
  getLaboratories: () => apiRequest('/laboratories'),

  // GET /benches -> [{ id, name, labId }]  mize za pipetiranje
  getBenches: () => apiRequest('/benches'),

  // --- Zaloga reagentov (2. vnos) ---
  // GET /reagents -> [{ id, name, unit, quantity }] unit: 'paketi' | 'ml'
  getReagents: () => apiRequest('/reagents'),

  // POST /reagents/shipments  { reagentName, quantity, unit, receivedAt } -> { id }
  // unit: 'paketi' | 'ml' - za znane reagente (fiziološka raztopina, destilirana
  // voda) se na frontendu samodejno predlaga 'paketi', za ostale 'ml'.
  // Backend naj pri unit === 'paketi' in quantity <= 2 sproži opozorilo za naročilo.
  addReagentShipment: (data) => apiRequest('/reagents/shipments', { method: 'POST', body: data }),

  // --- Poročila ---
  // GET /reports?from=&to=&processId= -> [{ id, processId, generatedAt, summary, data }]
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports${query ? `?${query}` : ''}`);
  },

  // --- Pipetirna ploščica ---
  // POST /plosce  { preiskava, tip, datum, izvajal, delovnaPozicija, jamice } -> { id }
  // jamice: { "well_A1_serum": "...", "well_A1_od": "...", "well_A1_rezultat": "...", ... }
  createPloscica: (data) => apiRequest('/plosce', { method: 'POST', body: data }),
};
