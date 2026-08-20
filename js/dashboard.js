/**
 * dashboard.js
 * Statistika, tabela procesov in filtri (proces, lokacija, status)
 * prek chip-dropdown menijev.
 */

const FILTERS = [
  { key: 'processType', label: 'Proces' },
  { key: 'location', label: 'Lokacija' },
  { key: 'status', label: 'Status' },
];

let allProcesses = [];
const activeFilters = { processType: new Set(), location: new Set(), status: new Set() };

async function loadDashboard() {
  const sampleOverviewEl = document.getElementById('sample-overview');
  const tableBody = document.getElementById('processes-table-body');

  try {
    // --- MOCK podatki: procesi (spodnja filtrirana tabela) ---
    allProcesses = [
      { id: 1, mbl: 'MBL-2026-0142', name: 'Polnjenje serije A-14', processType: 'Polnjenje', status: 'ok', location: 'Skladišče 1', startedAt: '2026-07-24 08:12' },
      { id: 2, mbl: 'MBL-2026-0143', name: 'Kontrola kakovosti B-02', processType: 'Kontrola kakovosti', status: 'warn', location: 'Linija 2', startedAt: '2026-07-25 10:03' },
      { id: 3, mbl: 'MBL-2026-0144', name: 'Vzdrževanje stroja C-5', processType: 'Vzdrževanje', status: 'error', location: 'Delavnica', startedAt: '2026-07-25 14:40' },
      { id: 4, mbl: 'MBL-2026-0145', name: 'Pakiranje D-9', processType: 'Pakiranje', status: 'ok', location: 'Skladišče 3', startedAt: '2026-07-26 07:55' },
      { id: 5, mbl: 'MBL-2026-0146', name: 'Kontrola kakovosti B-03', processType: 'Kontrola kakovosti', status: 'ok', location: 'Linija 2', startedAt: '2026-07-26 09:20' },
      { id: 6, mbl: 'MBL-2026-0147', name: 'Polnjenje serije A-15', processType: 'Polnjenje', status: 'warn', location: 'Skladišče 1', startedAt: '2026-07-27 08:05' },
    ];
    // --- konec mock bloka ---
    // TODO: ko backend obstaja, zamenjaj zgornji mock seznam z API.getProcesses()

    // --- MOCK podatki: vzorci, ki čakajo na preiskavo ---
    // TODO: ko backend obstaja, zamenjaj z API.getPacienti() in izračunaj enako
    const samples = [
      { preiskava: 'Ošpice', tip: 'IgG', datumOdvzema: '2026-07-24' },
      { preiskava: 'Ošpice', tip: 'IgG', datumOdvzema: '2026-07-25' },
      { preiskava: 'Ošpice', tip: 'IgM', datumOdvzema: '2026-07-25' },
      { preiskava: 'Ošpice', tip: 'IgM', datumOdvzema: '2026-07-27' },
      { preiskava: 'Rdečke', tip: null, datumOdvzema: '2026-07-26' },
      { preiskava: 'Hepatitis B', tip: null, datumOdvzema: '2026-07-20' },
      { preiskava: 'Hepatitis B', tip: null, datumOdvzema: '2026-07-27' },
    ];
    // --- konec mock bloka ---

    renderSampleOverview(samples, sampleOverviewEl);
    renderFilterBar();
    renderTable();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4">Napaka pri nalaganju: ${err.message}</td></tr>`;
  }
}

function formatDateSl(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderSampleOverview(samples, container) {
  // združi vzorce po preiskavi (+ tip, npr. IgG/IgM): število čakajočih + datum prvega prispelega vzorca
  const groups = {};
  samples.forEach((s) => {
    const key = s.tip ? `${s.preiskava}||${s.tip}` : `${s.preiskava}||`;
    if (!groups[key]) groups[key] = { preiskava: s.preiskava, tip: s.tip, dates: [] };
    groups[key].dates.push(s.datumOdvzema);
  });

  const keys = Object.keys(groups).sort();

  if (keys.length === 0) {
    container.innerHTML = `<div class="empty-state">Trenutno ni vzorcev, ki čakajo na preiskavo.</div>`;
    return;
  }

  container.innerHTML = keys
    .map((key) => {
      const g = groups[key];
      const count = g.dates.length;
      const firstDate = g.dates.reduce((a, b) => (a < b ? a : b));
      const title = g.tip ? `${g.preiskava} ${g.tip}` : g.preiskava;
      const href = `plosca.html?preiskava=${encodeURIComponent(g.preiskava)}&tip=${encodeURIComponent(g.tip || '')}`;
      return `
      <div class="sample-card sample-card-clickable" onclick="window.location.href='${href}'">
        <div class="sample-title">${title}</div>
        <div class="sample-count">${count}</div>
        <div class="sample-count-label">${count === 1 ? 'vzorec čaka' : 'vzorcev čaka'}</div>
        <div class="sample-date">Prvi vzorec: ${formatDateSl(firstDate)}</div>
      </div>
    `;
    })
    .join('');
}

function statusLabel(status) {
  return { ok: 'Končano', warn: 'V procesu', error: 'Napaka' }[status] || status;
}

function getUniqueValues(key) {
  return [...new Set(allProcesses.map((p) => p[key]))].sort();
}

function renderFilterBar() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  bar.innerHTML =
    FILTERS.map((f) => renderFilterGroup(f)).join('') +
    `<button type="button" class="filter-reset-all" id="reset-all-filters" style="display:none;">Počisti vse filtre</button>`;

  FILTERS.forEach((f) => {
    const badge = document.getElementById(`filter-badge-${f.key}`);
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(f.key);
    });
  });

  bar.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const { key } = cb.dataset;
      if (cb.checked) activeFilters[key].add(cb.value);
      else activeFilters[key].delete(cb.value);
      updateBadgeStates();
      renderTable();
    });
  });

  bar.querySelectorAll('.filter-clear').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilters[btn.dataset.key].clear();
      renderFilterBar();
      renderTable();
    });
  });

  const resetAll = document.getElementById('reset-all-filters');
  resetAll.addEventListener('click', () => {
    FILTERS.forEach((f) => activeFilters[f.key].clear());
    renderFilterBar();
    renderTable();
  });

  updateBadgeStates();
}

function renderFilterGroup(f) {
  const values = getUniqueValues(f.key);
  const options = values
    .map((v) => {
      const label = f.key === 'status' ? statusLabel(v) : v;
      const checked = activeFilters[f.key].has(v) ? 'checked' : '';
      return `<label><input type="checkbox" data-key="${f.key}" value="${v}" ${checked}> ${label}</label>`;
    })
    .join('');

  return `
    <div class="filter-group">
      <button type="button" class="badge filter-badge" id="filter-badge-${f.key}">${f.label}<span class="chev">▾</span></button>
      <div class="filter-dropdown" id="filter-dropdown-${f.key}" hidden onclick="event.stopPropagation()">
        ${options}
        <button type="button" class="btn filter-clear" data-key="${f.key}">Počisti</button>
      </div>
    </div>
  `;
}

function toggleDropdown(key) {
  FILTERS.forEach((f) => {
    const dd = document.getElementById(`filter-dropdown-${f.key}`);
    const badge = document.getElementById(`filter-badge-${f.key}`);
    if (f.key === key) {
      dd.hidden = !dd.hidden;
      badge.classList.toggle('open', !dd.hidden);
    } else {
      dd.hidden = true;
      badge.classList.remove('open');
    }
  });
}

document.addEventListener('click', () => {
  FILTERS.forEach((f) => {
    const dd = document.getElementById(`filter-dropdown-${f.key}`);
    const badge = document.getElementById(`filter-badge-${f.key}`);
    if (dd) dd.hidden = true;
    if (badge) badge.classList.remove('open');
  });
});

function updateBadgeStates() {
  FILTERS.forEach((f) => {
    const badge = document.getElementById(`filter-badge-${f.key}`);
    if (!badge) return;
    const count = activeFilters[f.key].size;
    badge.classList.toggle('has-selection', count > 0);
    badge.innerHTML = `${f.label}${count ? ` (${count})` : ''}<span class="chev">▾</span>`;
  });
  const anyActive = FILTERS.some((f) => activeFilters[f.key].size > 0);
  const resetAll = document.getElementById('reset-all-filters');
  if (resetAll) resetAll.style.display = anyActive ? 'inline-block' : 'none';
}

function getFilteredProcesses() {
  return allProcesses.filter((p) =>
    FILTERS.every((f) => activeFilters[f.key].size === 0 || activeFilters[f.key].has(p[f.key]))
  );
}

function renderTable() {
  const tableBody = document.getElementById('processes-table-body');
  const filtered = getFilteredProcesses();

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Ni procesov, ki bi ustrezali izbranim filtrom.</div></td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered
    .map(
      (p) => `
    <tr onclick="window.location.href='process-details.html?id=${p.id}'">
      <td>${p.name}<div class="helptext" style="margin-top:2px;">${p.mbl}</div></td>
      <td>${p.location}</td>
      <td>${p.startedAt}</td>
      <td><span class="badge ${p.status}">${statusLabel(p.status)}</span></td>
    </tr>
  `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
