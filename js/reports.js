async function loadReports() {
  const tableBody = document.getElementById('reports-table-body');

  try {
    // TODO: ko backend obstaja: const reports = await API.getReports();

    // --- MOCK podatki ---
    const reports = [
      { id: 101, process: 'Kontrola kakovosti B-02', generatedAt: '2026-07-25 11:00', summary: '2 meritvi, 1 opozorilo' },
      { id: 102, process: 'Polnjenje serije A-14', generatedAt: '2026-07-24 09:00', summary: '5 meritev, brez opozoril' },
    ];
    // --- konec mock bloka ---

    tableBody.innerHTML = reports.map((r) => `
      <tr>
        <td>${r.process}</td>
        <td>${r.generatedAt}</td>
        <td>${r.summary}</td>
        <td><button class="btn" onclick="alert('Prenos poročila #${r.id} - poveži z backendom')">Prenesi</button></td>
      </tr>
    `).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4">Napaka pri nalaganju: ${err.message}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', loadReports);
