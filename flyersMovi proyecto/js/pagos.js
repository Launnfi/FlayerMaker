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

    // Sin sesión → mandar a login con Google primero
    if (res.status === 401) {
      mostrarToast('Iniciá sesión para suscribirte');
      if (btn) { btn.disabled = false; btn.textContent = plan === 'pro' ? 'Activar Pro' : 'Activar Premium'; }
      if (typeof iniciarLoginGoogle === 'function') setTimeout(iniciarLoginGoogle, 800);
      return;
    }

    if (!res.ok) throw new Error(data.error || 'Error al crear pago');

    // Redirigir a MercadoPago
    window.location.href = data.init_point;
  } catch (err) {
    console.error(err);
    mostrarToast('Error de pago: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = plan === 'pro' ? 'Activar Pro' : 'Activar Premium'; }
  }
}

// Aplica un plan pagado al estado y re-renderiza la UI dependiente del plan.
function aplicarPlanPagado(plan) {
  State.plan = plan;
  actualizarUIPlanes();
  actualizarLockUI();
  if (typeof renderizarGridPlantillas === 'function') renderizarGridPlantillas();
  if (typeof renderizarFormatosBtns  === 'function') renderizarFormatosBtns();
  if (typeof renderizarFuentesGrid   === 'function') renderizarFuentesGrid();
  if (typeof generarFlyer === 'function') generarFlyer();
}

// ── Verificar retorno de MercadoPago ──
// MercadoPago agrega payment_id a las back_urls. NO confiamos en mp_success/mp_plan
// (se pueden falsificar en la URL): pedimos al servidor que confirme el pago real
// contra la API de MercadoPago antes de activar el plan.
async function verificarRetornoPago() {
  const params = new URLSearchParams(window.location.search);
  const limpiarURL = () => window.history.replaceState({}, '', window.location.pathname);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  if (params.get('mp_failure') === '1') {
    limpiarURL();
    mostrarToast('✗ Pago cancelado o rechazado');
    return;
  }

  if (params.get('mp_success') !== '1' && params.get('mp_pending') !== '1') return;

  const paymentId = params.get('payment_id') || params.get('collection_id');
  if (!paymentId) {
    // Sin payment_id no se puede verificar contra MercadoPago → no activar.
    limpiarURL();
    mostrarToast('No se pudo verificar el pago con MercadoPago');
    return;
  }

  try {
    const res  = await fetch(`/api/mercadopago/verificar?payment_id=${encodeURIComponent(paymentId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al verificar el pago');

    if (data.approved && data.plan) {
      aplicarPlanPagado(data.plan);
      mostrarToast(`✓ Plan ${cap(data.plan)} activado`);
    } else if (data.status === 'pending' || data.status === 'in_process') {
      mostrarToast('⏳ Pago pendiente — se activará cuando se confirme');
    } else {
      mostrarToast('✗ El pago no fue aprobado');
    }
  } catch (err) {
    console.error(err);
    mostrarToast('Error al verificar el pago: ' + err.message);
  } finally {
    limpiarURL();
  }
}

// ── Ejecutar al cargar ──
document.addEventListener('DOMContentLoaded', verificarRetornoPago);
