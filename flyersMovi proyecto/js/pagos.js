/* ══════════════════════════════════
   PAGOS.JS — Integración MercadoPago
   ══════════════════════════════════ */

async function iniciarPago(plan) {
  const btn = document.querySelector(`.btn-plan-sel[data-plan="${plan}"]`);
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Conectando con MercadoPago...'; }

  try {
    const res = await fetch('/api/mercadopago/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear pago');

    // Redirigir a MercadoPago
    window.location.href = data.init_point;
  } catch (err) {
    console.error(err);
    mostrarToast('Error de pago: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = plan === 'pro' ? 'Activar Pro' : 'Activar Premium'; }
  }
}

// ── Verificar retorno de MercadoPago ──
function verificarRetornoPago() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('mp_success') === '1') {
    const plan = params.get('mp_plan') || 'pro';
    State.plan = plan;
    actualizarUIPlanes();
    actualizarLockUI();
    if (typeof renderizarGridPlantillas === 'function') renderizarGridPlantillas();
    if (typeof renderizarFormatosBtns  === 'function') renderizarFormatosBtns();
    if (typeof renderizarFuentesGrid   === 'function') renderizarFuentesGrid();
    if (typeof generarFlyer === 'function') generarFlyer();

    // Limpiar URL params sin recargar
    window.history.replaceState({}, '', window.location.pathname);

    mostrarToast(`✓ Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} activado`);
  }

  if (params.get('mp_failure') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    mostrarToast('✗ Pago cancelado o rechazado');
  }

  if (params.get('mp_pending') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    mostrarToast('⏳ Pago pendiente — se activará cuando se confirme');
  }
}

// ── Ejecutar al cargar ──
document.addEventListener('DOMContentLoaded', verificarRetornoPago);
