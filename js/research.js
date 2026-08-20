/**
 * research.js
 * Logika obrazca "Nova raziskava": polnjenje spustnih seznamov (mock),
 * samodejni datum in podpisna ploščica (canvas).
 */

// --- MOCK šifranti (dokler backend ne obstaja) ---
const MOCK_LABS = ['Laboratorij 1', 'Laboratorij 2', 'Laboratorij 3'];
const MOCK_BENCHES = ['Miza 1', 'Miza 2', 'Miza 3', 'Miza 4'];
const MOCK_REAGENTS = ['Fiziološka raztopina', 'Etanol 70%', 'Destilirana voda', 'Pufer PBS'];
// --- konec mock bloka ---
// TODO: ko backend obstaja, zamenjaj zgornje sezname z:
// const labs = await API.getLaboratories(); const benches = await API.getBenches(); const reagents = await API.getReagents();

function fillSelect(selectEl, values) {
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
}

function formatNowSl() {
  return new Date().toLocaleString('sl-SI', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* --- Podpisna ploščica --- */
function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  const ctx = canvas.getContext('2d');
  const hiddenInput = document.getElementById('signatureData');
  const clearBtn = document.getElementById('clear-signature');
  const errorBox = document.getElementById('signature-error');
  let drawing = false;
  let hasSignature = false;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = '#E6E9EF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  resizeCanvas();

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    hasSignature = true;
    errorBox.classList.remove('visible');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function end() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    hiddenInput.value = '';
  });

  return {
    isSigned: () => hasSignature,
    captureDataUrl: () => {
      hiddenInput.value = canvas.toDataURL('image/png');
      return hiddenInput.value;
    },
    reset: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSignature = false;
      hiddenInput.value = '';
    },
  };
}

function initResearchForm(signaturePad) {
  const form = document.getElementById('research-form');
  const errorBox = document.getElementById('form-error');
  const successBox = document.getElementById('form-success');
  const signatureError = document.getElementById('signature-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');
    successBox.style.display = 'none';
    signatureError.classList.remove('visible');

    if (!signaturePad.isSigned()) {
      signatureError.textContent = 'Podpis je obvezen.';
      signatureError.classList.add('visible');
      return;
    }
    signaturePad.captureDataUrl();

    const data = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      // TODO: ko backend obstaja, odstrani mock in odkomentiraj:
      // await API.createResearch(data);

      // --- MOCK ---
      await new Promise((r) => setTimeout(r, 300));
      console.log('Mock oddaja raziskave:', data);
      // --- konec mock bloka ---

      successBox.style.display = 'block';
      form.reset();
      signaturePad.reset();
      document.getElementById('date').value = formatNowSl();
    } catch (err) {
      errorBox.textContent = err.message || 'Napaka pri shranjevanju.';
      errorBox.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').value = formatNowSl();
  fillSelect(document.getElementById('laboratory'), MOCK_LABS);
  fillSelect(document.getElementById('bench'), MOCK_BENCHES);
  fillSelect(document.getElementById('reagent'), MOCK_REAGENTS);

  const signaturePad = initSignaturePad();
  initResearchForm(signaturePad);
});
