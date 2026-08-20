/**
 * plosca.js
 * Izris pipetirne ploščice (8 vrstic A-H x 6 stolpcev), kjer ima vsaka
 * jamica 3 podvrstice: Serum, OD, Rezultat (glej priloženo predlogo
 * "Anti Ošpice - EIT"). Glava: preiskava/tip iz URL parametrov,
 * datum in izvajalec se izpolnita samodejno, delovna pozicija ročno.
 *
 * Stolpec 1, vrstice A-D so vedno fiksne kontrole (Blank/NK/Standard) -
 * te vrednosti se ne spreminjajo. Vsa ostala Serum polja se samodejno
 * napolnijo po vrsti iz čakalne vrste vzorcev - uporabnik jih ne more
 * ročno urejati (readonly). OD in Rezultat pri vzorcih ostaneta odprta
 * za vnos dejanskih izmerjenih vrednosti.
 */

const PLATE_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const PLATE_COLS = [1, 2, 3, 4, 5, 6];
const SUB_ROWS = ['Serum', 'OD', 'Rezultat'];

// --- Fiksne kontrole v 1. stolpcu (vedno enake, se ne urejajo) ---
const CONTROLS = {
  A: { serum: 'Blank', od: '0', rezultat: '0,0' },
  B: { serum: 'NK', od: '0', rezultat: '0,0' },
  C: { serum: 'Standard', od: '0', rezultat: '0,0' },
  D: { serum: 'Standard', od: '0', rezultat: '' },
};

// --- MOCK: vzorci, ki čakajo na to preiskavo (po vrsti) ---
// TODO: ko bo backend (PB) narejen, zamenjaj z dejansko čakalno vrsto vzorcev za to preiskavo/tip
const MOCK_WAITING_SAMPLES = [
  'V2/3411', 'V2/3417', 'V2/3418', 'V2/3425',
  'V2/3431', 'V2/3433', 'V2/3434', 'V2/3439', 'V2/3446', 'V2/3450', 'V2/3455', 'V2/3459',
  'V2/3460', 'V2/3471', 'V2/3472', 'V2/3473', 'V2/3476', 'V2/3477', 'V2/3489',
];

// --- MOCK: LOT številka in rok uporabe reagenta glede na tip (IgG/IgM) ---
// TODO: ko bo backend (PB) narejen, zamenjaj z dejanskimi podatki o reagentu
const MOCK_LOT_INFO = {
  IgG: { lot: 'EQ0240', expiry: '30.11.2027' },
  IgM: { lot: 'EQ0064', expiry: '28.02.2027' },
};

function formatNowSl() {
  return new Date().toLocaleString('sl-SI', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getLoggedInUsername() {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.username || '—';
  } catch {
    return '—';
  }
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return { preiskava: params.get('preiskava') || '', tip: params.get('tip') || '' };
}

function setHeader() {
  const { preiskava, tip } = getUrlParams();
  const title = tip ? `${preiskava} — ${tip}` : preiskava;

  document.getElementById('plate-title').textContent = title || 'Pipetirna ploščica';
  document.title = `${title || 'Pipetirna ploščica'} — Procesni nadzor`;

  document.getElementById('datum').value = formatNowSl();
  document.getElementById('izvajal').value = getLoggedInUsername();

  const lot = MOCK_LOT_INFO[tip] || { lot: '—', expiry: '—' };
  document.getElementById('lot-info').innerHTML =
    `<span class="label">LOT:</span> ${lot.lot} &nbsp;·&nbsp; <span class="label">Rok uporabe:</span> ${lot.expiry}`;
}

/**
 * Izračuna vsebino vsake jamice (stolpčno po vrsti, tako kot na predlogi):
 * najprej stolpec 1 (kontrole A-D, nato vzorci E-H), nato stolpec 2 (A-H), itd.
 */
function computeWells() {
  const map = {};
  const queue = [...MOCK_WAITING_SAMPLES];

  PLATE_COLS.forEach((col) => {
    PLATE_ROWS.forEach((row) => {
      const key = `${row}${col}`;
      if (col === 1 && CONTROLS[row]) {
        map[key] = { type: 'control', ...CONTROLS[row] };
      } else {
        const sample = queue.shift();
        map[key] = sample
          ? { type: 'sample', serum: sample, od: '', rezultat: '' }
          : { type: 'empty', serum: '', od: '', rezultat: '' };
      }
    });
  });

  return map;
}

function buildPlateTable() {
  const tbody = document.getElementById('plate-body');
  const wells = computeWells();
  let html = '';

  PLATE_ROWS.forEach((row) => {
    SUB_ROWS.forEach((sub, i) => {
      html += `<tr${i === 0 ? ' class="row-group-start"' : ''}>`;
      if (i === 0) {
        html += `<td class="well-label" rowspan="${SUB_ROWS.length}">${row}</td>`;
      }
      html += `<td class="sub-label">${sub}</td>`;

      PLATE_COLS.forEach((col) => {
        const well = wells[`${row}${col}`];
        const id = `well_${row}${col}_${sub.toLowerCase()}`;
        const isSerum = sub === 'Serum';
        const isNumeric = !isSerum;

        // Serum: vedno readonly (prihaja iz čakalne vrste/PB).
        // OD/Rezultat: readonly samo pri fiksnih kontrolah, sicer odprto za vnos.
        const readonly = isSerum || well.type === 'control';
        const value = isSerum ? well.serum : sub === 'OD' ? well.od : well.rezultat;
        const cls = readonly ? ' class="readonly-cell"' : '';

        html += `<td><input type="${isNumeric ? 'text' : 'text'}" ${readonly ? 'readonly tabindex="-1"' : ''}${cls} id="${id}" name="${id}" value="${value}"></td>`;
      });

      html += '</tr>';
    });
  });

  tbody.innerHTML = html;
}

function collectPlateData() {
  const data = {};
  PLATE_ROWS.forEach((row) => {
    PLATE_COLS.forEach((col) => {
      SUB_ROWS.forEach((sub) => {
        const id = `well_${row}${col}_${sub.toLowerCase()}`;
        const el = document.getElementById(id);
        if (el && el.value !== '') data[id] = el.value;
      });
    });
  });
  return data;
}

function initSave() {
  const btn = document.getElementById('save-plate');
  const successBox = document.getElementById('save-success');

  btn.addEventListener('click', async () => {
    const { preiskava, tip } = getUrlParams();
    const payload = {
      preiskava,
      tip,
      datum: document.getElementById('datum').value,
      izvajal: document.getElementById('izvajal').value,
      delovnaPozicija: document.getElementById('delovna-pozicija').value,
      jamice: collectPlateData(),
    };

    btn.disabled = true;
    try {
      // TODO: ko backend obstaja, odstrani mock in odkomentiraj:
      // await API.createPloscica(payload);

      // --- MOCK ---
      await new Promise((r) => setTimeout(r, 300));
      console.log('Mock shranjevanje ploščice:', payload);
      // --- konec mock bloka ---

      successBox.style.display = 'block';
      setTimeout(() => { successBox.style.display = 'none'; }, 2500);
    } finally {
      btn.disabled = false;
    }
  });
}

function initPrint() {
  const btn = document.getElementById('print-plate');
  btn.addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', () => {
  setHeader();
  buildPlateTable();
  initSave();
  initPrint();
});
