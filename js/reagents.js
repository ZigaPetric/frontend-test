/**
 * reagents.js
 * Logika strani "Zaloga reagentov": prikaz trenutne zaloge, opozorilo za
 * naročilo pri nizki zalogi (prag je nastavljiv na strani Nastavitve →
 * Reagenti, glej reagent-config.js) in vnos nove pošiljke.
 *
 * Enota (paketi / mililitri) se za znane reagente določi samodejno glede
 * na naziv (KNOWN_REAGENTS v reagent-config.js) - takoj ko uporabnik
 * vpiše/izbere reagent, se izbira enote sama posodobi.
 */

const UNIT_LABELS = { paketi: 'paketov', ml: 'ml' };

// --- MOCK trenutna zaloga (dokler backend ne obstaja) ---
// TODO: ko backend obstaja, zamenjaj z: let stock = await API.getReagents();
let stock = [
  { id: 1, name: 'Fiziološka raztopina', unit: 'paketi', quantity: 6 },
  { id: 2, name: 'Etanol 70%', unit: 'ml', quantity: 250 },
  { id: 3, name: 'Destilirana voda', unit: 'paketi', quantity: 10 },
  { id: 4, name: 'Pufer PBS', unit: 'ml', quantity: 80 },
];
// --- konec mock bloka ---

function formatNowSl() {
  return new Date().toLocaleString('sl-SI', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function renderStockTable() {
  const body = document.getElementById('stock-table-body');
  const banner = document.getElementById('low-stock-banner');
  const datalist = document.getElementById('known-reagents');

  const low = stock.filter((r) => r.quantity <= getThreshold(r.name, r.unit));
  if (low.length > 0) {
    banner.style.display = 'block';
    banner.textContent = `⚠ Nizka zaloga: ${low.map((r) => r.name).join(', ')} — potrebno naročilo.`;
  } else {
    banner.style.display = 'none';
  }

  body.innerHTML = stock
    .map((r) => {
      const isLow = r.quantity <= getThreshold(r.name, r.unit);
      return `
      <tr>
        <td>${r.name}</td>
        <td>${r.quantity} ${UNIT_LABELS[r.unit] || r.unit}</td>
        <td><span class="badge ${isLow ? 'error' : 'ok'}">${isLow ? 'Naroči' : 'V redu'}</span></td>
      </tr>
    `;
    })
    .join('');

  const uniqueNames = [...new Set(stock.map((r) => r.name))];
  datalist.innerHTML = uniqueNames.map((name) => `<option value="${name}"></option>`).join('');
}

function initAutoUnit() {
  const nameInput = document.getElementById('reagentName');
  const unitSelect = document.getElementById('unit');

  nameInput.addEventListener('input', () => {
    if (!nameInput.value.trim()) return;
    unitSelect.value = getReagentUnit(nameInput.value);
  });
}

function initReagentForm() {
  const form = document.getElementById('reagent-stock-form');
  const errorBox = document.getElementById('form-error');
  const successBox = document.getElementById('form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');
    successBox.style.display = 'none';

    const data = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      // TODO: ko backend obstaja, odstrani mock in odkomentiraj:
      // await API.addReagentShipment(data);

      // --- MOCK: posodobi lokalni prikaz zaloge ---
      await new Promise((r) => setTimeout(r, 300));
      const qty = parseFloat(data.quantity);
      const name = data.reagentName.trim();
      const unit = data.unit;

      const existing = stock.find(
        (r) => r.name.toLowerCase() === name.toLowerCase() && r.unit === unit
      );
      if (existing) existing.quantity += qty;
      else stock.push({ id: stock.length + 1, name, unit, quantity: qty });
      renderStockTable();
      // --- konec mock bloka ---

      successBox.style.display = 'block';
      form.reset();
      document.getElementById('receivedAt').value = formatNowSl();
      document.getElementById('unit').value = 'ml';
    } catch (err) {
      errorBox.textContent = err.message || 'Napaka pri shranjevanju.';
      errorBox.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('receivedAt').value = formatNowSl();
  renderStockTable();
  initAutoUnit();
  initReagentForm();
});
