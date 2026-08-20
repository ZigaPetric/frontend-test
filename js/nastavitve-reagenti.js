/**
 * nastavitve-reagenti.js
 * Logika strani "Nastavitve → Reagenti": za vsak znan reagent prikaže
 * uredljiv prag opozorila (v enoti tega reagenta) in ga shrani prek
 * reagent-config.js (localStorage, dokler ne obstaja backend).
 */

const UNIT_LABELS_SETTINGS = { paketi: 'paketi', ml: 'ml' };

function renderThresholdsTable() {
  const body = document.getElementById('thresholds-table-body');

  body.innerHTML = KNOWN_REAGENTS.map((r) => {
    const current = getThreshold(r.name, r.unit);
    return `
      <tr>
        <td>${r.name}</td>
        <td>${UNIT_LABELS_SETTINGS[r.unit] || r.unit}</td>
        <td>
          <input
            type="number" step="any" min="0"
            data-reagent="${r.name}"
            value="${current}"
            style="max-width:100px;"
          >
        </td>
      </tr>
    `;
  }).join('');
}

function initSave() {
  const btn = document.getElementById('save-thresholds');
  const successBox = document.getElementById('save-success');

  btn.addEventListener('click', () => {
    document.querySelectorAll('#thresholds-table-body input[data-reagent]').forEach((input) => {
      const name = input.dataset.reagent;
      const value = input.value === '' ? '' : Number(input.value);
      setThreshold(name, value);
    });

    // TODO: ko backend obstaja, poleg localStorage tukaj pošlji tudi API klic,
    // da se pragi shranijo skupno za vse uporabnike (ne samo lokalno v brskalniku).

    successBox.style.display = 'block';
    setTimeout(() => { successBox.style.display = 'none'; }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderThresholdsTable();
  initSave();
});
