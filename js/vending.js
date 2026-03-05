/* ============================================
   SANSAY SHAKEN CERT — Vending Machine Logic
   ============================================ */

const ITEMS = [
  // Row A
  { slot: 'A1', name: 'Basic Attestation',   desc: 'Entry-level SHAKEN certificate for call authentication',     price: 500,  color: '#4a9eff' },
  { slot: 'A2', name: 'Compliance Score+',   desc: 'Enhanced compliance scoring with real-time monitoring',       price: 550,  color: '#6c5ce7' },
  { slot: 'A3', name: 'Cross-Net Token',     desc: 'Multi-carrier cross-network authentication token',           price: 800,  color: '#e84393' },
  // Row B
  { slot: 'B1', name: 'SBC Gateway Cert',    desc: 'Session Border Controller compliance certification',         price: 500,  color: '#00b894' },
  { slot: 'B2', name: 'Advanced STI-VS',     desc: 'Advanced SHAKEN verification service with full analytics',   price: 800,  color: '#fdcb6e' },
  { slot: 'B3', name: 'Master SHAKEN',       desc: 'Master-level STIR/SHAKEN implementation certification',      price: 900,  color: '#e17055' },
  // Row C
  { slot: 'C1', name: 'Robocall Shield',     desc: 'Anti-robocall defense certification and compliance badge',   price: 500,  color: '#0984e3' },
  { slot: 'C2', name: 'Carrier Gateway Pro', desc: 'Carrier-grade gateway cert with full attestation support',   price: 900,  color: '#a29bfe' },
  { slot: 'C3', name: 'Enterprise Bundle',   desc: 'Complete enterprise STIR/SHAKEN deployment package',         price: 1000, color: '#d63031' },
  // Row D
  { slot: 'D1', name: 'Custom Attestation',  desc: 'Tailored attestation service for unique deployments',        price: 600,  color: '#00cec9' },
  { slot: 'D2', name: 'Network Auditor',     desc: 'Full network audit and SHAKEN compliance report',            price: 750,  color: '#fab1a0' },
  { slot: 'D3', name: 'Vault Reset',         desc: 'Certificate key rotation and vault management',              price: 450,  color: '#55efc4' },
];

/* ---------- State ---------- */
let inputCode = '';
let isDispensing = false;
let audioCtx = null;

/* ---------- DOM ---------- */
const $ = (sel) => document.querySelector(sel);
const displayCode  = $('#displayCode');
const displayPrice = $('#displayPrice');
const itemsGrid    = $('#itemsGrid');
const trayArea     = $('#trayArea');
const trayInstruction = $('#trayInstruction');
const machine      = $('#machine');
const glassFrame   = $('.glass-frame');

/* ============================================
   CERTIFICATE SVG ICON
   ============================================ */
const certSVG = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="3" width="32" height="22" rx="2.5" fill="currentColor" opacity="0.12"/>
  <rect x="4" y="3" width="32" height="22" rx="2.5" stroke="currentColor" stroke-width="1.4"/>
  <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" stroke-width="1" opacity="0.45"/>
  <line x1="10" y1="14" x2="26" y2="14" stroke="currentColor" stroke-width="1" opacity="0.45"/>
  <line x1="10" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="1" opacity="0.45"/>
  <circle cx="30" cy="28" r="8" fill="currentColor" opacity="0.15"/>
  <circle cx="30" cy="28" r="8" stroke="currentColor" stroke-width="1.4"/>
  <path d="M27 28L29 30L33 26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ============================================
   COIL SVG
   ============================================ */
const coilSVG = `<svg viewBox="0 0 70 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5,6 C5,2 12,2 12,6 C12,10 19,10 19,6 C19,2 26,2 26,6 C26,10 33,10 33,6 C33,2 40,2 40,6 C40,10 47,10 47,6 C47,2 54,2 54,6 C54,10 61,10 61,6 C61,2 68,2 68,6"
        fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

/* ============================================
   AUDIO (Web Audio API — no files needed)
   ============================================ */
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBeep() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) { /* audio not available */ }
}

function playClunk() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

function playError() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(140, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

function playSuccess() {
  try {
    const ctx = getAudioCtx();
    [440, 554, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  } catch (_) {}
}

/* ============================================
   RENDER ITEMS
   ============================================ */
function renderItems() {
  let html = '';
  let lastRow = '';

  ITEMS.forEach((item, idx) => {
    const row = item.slot[0];

    // Add shelf divider between rows
    if (lastRow && row !== lastRow) {
      html += '<div class="shelf-row" aria-hidden="true"></div>';
    }
    lastRow = row;

    html += `
      <div class="item-card" data-slot="${item.slot}" id="item-${item.slot}"
           style="--item-accent: ${item.color}" tabindex="0" role="button"
           aria-label="${item.name}, ${item.slot}, $${item.price}">
        <div class="item-slot-code">${item.slot}</div>
        <div class="item-cert-icon">${certSVG}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-price">$${item.price.toLocaleString()}</div>
        <div class="item-coil">${coilSVG}</div>
      </div>`;
  });

  itemsGrid.innerHTML = html;

  // Click handlers
  document.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isDispensing) return;
      playBeep();
      selectItem(card.dataset.slot);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isDispensing) return;
        playBeep();
        selectItem(card.dataset.slot);
      }
    });
  });
}

/* ============================================
   KEYPAD
   ============================================ */
function setupKeypad() {
  document.querySelectorAll('#keypad button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isDispensing && btn.dataset.key !== 'clear') return;
      playBeep();
      const key = btn.dataset.key;
      handleKeyInput(key);

      // Tactile press animation
      gsap.to(btn, { scale: 0.88, duration: 0.06, yoyo: true, repeat: 1 });
    });
  });
}

function handleKeyInput(key) {
  if (key === 'clear') {
    inputCode = '';
    updateDisplay('--', '');
    clearSelection();
    return;
  }

  if (key === 'select') {
    if (inputCode.length === 2) {
      selectItem(inputCode);
    }
    return;
  }

  // Build the two-character code
  if (inputCode.length < 2) {
    inputCode += key.toUpperCase();
    updateDisplay(inputCode.padEnd(2, '_'), '');

    // If two chars entered, show price preview
    if (inputCode.length === 2) {
      const item = ITEMS.find(i => i.slot === inputCode);
      if (item) {
        updateDisplay(inputCode, '$' + item.price.toLocaleString());
        highlightItem(inputCode);
      } else {
        updateDisplay(inputCode, 'N/A');
      }
    }
  }
}

/* ============================================
   DISPLAY & SELECTION
   ============================================ */
function updateDisplay(code, price) {
  displayCode.textContent = code;
  displayPrice.textContent = price || '\u00A0';
}

function highlightItem(slot) {
  clearSelection();
  const card = document.getElementById('item-' + slot);
  if (card) card.classList.add('selected');
}

function clearSelection() {
  document.querySelectorAll('.item-card.selected').forEach(c => c.classList.remove('selected'));
}

/* ============================================
   SELECT & DISPENSE
   ============================================ */
function selectItem(slot) {
  const item = ITEMS.find(i => i.slot === slot.toUpperCase());

  if (!item) {
    playError();
    updateDisplay('ERR', 'INVALID');
    gsap.to(machine, { x: '+=3', duration: 0.04, repeat: 5, yoyo: true });
    setTimeout(() => {
      updateDisplay('--', '');
      inputCode = '';
    }, 1200);
    return;
  }

  inputCode = item.slot;
  updateDisplay(item.slot, '$' + item.price.toLocaleString());
  highlightItem(item.slot);
  dispenseItem(item);
}

function dispenseItem(item) {
  if (isDispensing) return;
  isDispensing = true;

  const card = document.getElementById('item-' + item.slot);
  const cardRect = card.getBoundingClientRect();
  const trayRect = trayArea.getBoundingClientRect();

  // Create a clone that can fly outside the glass panel (which clips overflow)
  const clone = card.cloneNode(true);
  clone.id = '';
  clone.style.position = 'fixed';
  clone.style.top = cardRect.top + 'px';
  clone.style.left = cardRect.left + 'px';
  clone.style.width = cardRect.width + 'px';
  clone.style.height = cardRect.height + 'px';
  clone.style.zIndex = '100';
  clone.style.margin = '0';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  // Target: center of the tray
  const targetY = trayRect.top + trayRect.height / 2 - cardRect.height / 2;
  const targetX = trayRect.left + trayRect.width / 2 - cardRect.width / 2;
  const dropY = targetY - cardRect.top;
  const driftX = targetX - cardRect.left;

  const tl = gsap.timeline({
    onComplete: () => {
      inputCode = '';
    }
  });

  // 1. Glow the selected item
  tl.to(card, {
    boxShadow: `0 0 30px ${item.color}, 0 0 60px ${item.color}44`,
    scale: 1.06,
    duration: 0.3,
    ease: 'power2.out'
  });

  // Also glow the clone in sync
  tl.to(clone, {
    boxShadow: `0 0 30px ${item.color}, 0 0 60px ${item.color}44`,
    scale: 1.06,
    duration: 0.3,
    ease: 'power2.out'
  }, '<');

  // 2. Brief pause
  tl.to({}, { duration: 0.2 });

  // 3. Hide original, start falling the clone
  tl.call(() => {
    playClunk();
    card.style.visibility = 'hidden';
  });

  // Machine shake — coil releasing
  tl.to(machine, {
    x: '+=2', duration: 0.03, repeat: 6, yoyo: true, ease: 'none'
  });

  // 4. Clone falls to the tray — scroll the tray into view too
  tl.call(() => {
    trayArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  tl.to(clone, {
    y: dropY,
    x: driftX,
    scale: 0.75,
    rotation: gsap.utils.random(-10, 10),
    duration: Math.min(0.8, Math.max(0.4, dropY / 800)),
    ease: 'power2.in'
  }, '-=0.1');

  // 5. Landing thud
  tl.call(() => playClunk());
  tl.to(machine, {
    y: '+=2', duration: 0.04, repeat: 3, yoyo: true, ease: 'none'
  });

  // 6. Remove clone, show in tray
  tl.call(() => {
    clone.remove();
    playSuccess();
    showInTray(item);
  }, null, '+=0.1');

  // 7. Reset original card (hidden -> visible after a delay)
  tl.call(() => {
    card.style.visibility = '';
    card.style.boxShadow = '';
    gsap.set(card, { scale: 1, clearProps: 'boxShadow' });
  }, null, '+=0.5');

  tl.call(() => {
    isDispensing = false;
    clearSelection();
  });
}

/* ============================================
   TRAY
   ============================================ */
function showInTray(item) {
  trayArea.innerHTML = `
    <div class="tray-cert" id="trayCert" role="button" tabindex="0"
         aria-label="Checkout ${item.name} for $${item.price}">
      <div class="tray-cert-name">${item.name}</div>
      <div class="tray-cert-price">$${item.price.toLocaleString()}</div>
      <div class="tray-cert-action">TAP TO CHECKOUT &rarr;</div>
    </div>`;

  const trayCert = document.getElementById('trayCert');

  // Entrance animation
  gsap.from(trayCert, {
    y: -40,
    opacity: 0,
    duration: 0.5,
    ease: 'bounce.out'
  });

  // Pulse glow
  gsap.to(trayCert, {
    boxShadow: '0 0 20px rgba(244, 121, 32, 0.4), 0 0 40px rgba(244, 121, 32, 0.15)',
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // Navigate to checkout
  const goToCheckout = () => {
    const params = new URLSearchParams({
      slot: item.slot,
      name: item.name,
      price: item.price
    });
    window.location.href = 'checkout.html?' + params.toString();
  };

  trayCert.addEventListener('click', goToCheckout);
  trayCert.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToCheckout();
    }
  });
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Ignore if focused on an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();

    if (['A', 'B', 'C', 'D', '1', '2', '3'].includes(key)) {
      playBeep();
      handleKeyInput(key);
    } else if (e.key === 'Enter') {
      playBeep();
      handleKeyInput('select');
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      playBeep();
      handleKeyInput('clear');
    }
  });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderItems();
  setupKeypad();
  setupKeyboard();
});
