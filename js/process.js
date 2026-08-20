async function loadProcessDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '1';

  const titleEl = document.getElementById('process-title');
  const metaEl = document.getElementById('process-meta');
  const resultsBody = document.getElementById('results-table-body');

  try {
    // TODO: ko backend obstaja: const process = await API.getProcess(id);

    // --- MOCK podatki ---
    const process = {
      id,
      name: 'Kontrola kakovosti B-02',
      status: 'warn',
      location: 'Linija 2',
      startedAt: '2026-07-25 10:03',
      assets: ['Merilnik tlaka #4', 'Senzor temperature #11'],
      results: [
        { measuredAt: '2026-07-25 10:15', value: '2.4', unit: 'bar', note: 'V mejah' },
        { measuredAt: '2026-07-25 10:45', value: '2.9', unit: 'bar', note: 'Nad mejo opozorila' },
      ],
    };
    // --- konec mock bloka ---

    titleEl.textContent = process.name;
    metaEl.innerHTML = `
      <span class="badge ${process.status}">${process.status === 'ok' ? 'Končano' : process.status === 'warn' ? 'V procesu' : 'Napaka'}</span>
      <span>Lokacija: ${process.location}</span>
      <span>Začetek: ${process.startedAt}</span>
      <span>Sredstva: ${process.assets.join(', ')}</span>
    `;

    resultsBody.innerHTML = process.results.map((r) => `
      <tr>
        <td>${r.measuredAt}</td>
        <td>${r.value} ${r.unit}</td>
        <td>${r.note}</td>
      </tr>
    `).join('');
  } catch (err) {
    titleEl.textContent = 'Napaka pri nalaganju procesa';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadProcessDetails);
