/* ============================================
   SANSAY SHAKEN CERT — Checkout Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const name  = params.get('name')  || 'Unknown Certificate';
  const price = params.get('price') || '0';
  const slot  = params.get('slot')  || '--';

  /* ---- Populate order summary ---- */
  document.getElementById('orderName').textContent  = name;
  document.getElementById('orderSlot').textContent  = slot;
  document.getElementById('orderPrice').textContent = '$' + Number(price).toLocaleString();
  document.getElementById('payAmount').textContent  = '$' + Number(price).toLocaleString();

  /* ---- Card number formatting (groups of 4) ---- */
  document.getElementById('cardNumber').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = v;
  });

  /* ---- Expiry formatting (MM / YY) ---- */
  document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) {
      v = v.slice(0, 2) + ' / ' + v.slice(2, 4);
    }
    e.target.value = v;
  });

  /* ---- CVC: digits only ---- */
  document.getElementById('cardCvc').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  /* ---- ZIP: digits only ---- */
  document.getElementById('cardZip').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  /* ---- Form submission (mock) ---- */
  document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple visual transition
    const form    = document.getElementById('paymentForm');
    const summary = document.querySelector('.order-summary');
    const success = document.getElementById('successMessage');

    form.style.opacity = '0';
    form.style.transform = 'translateY(10px)';
    form.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      form.style.display    = 'none';
      summary.style.display = 'none';
      success.style.display = 'flex';
    }, 300);
  });
});
