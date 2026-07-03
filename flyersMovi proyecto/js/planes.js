/* ══════════════════════════════════
   PLANES.JS — Lógica de planes y modales
   ══════════════════════════════════ */

function abrirModalPlanes() {
  document.getElementById('modal-planes').style.display = 'flex';
  actualizarUIPlanes();
}

function cerrarModalPlanes() {
  document.getElementById('modal-planes').style.display = 'none';
}

function actualizarUIPlanes() {
  // Actualiza badge del header
  const labels = { basico: 'Plan Básico', pro: 'Plan Pro', premium: 'Plan Premium' };
  document.getElementById('plan-badge-label').textContent = labels[State.plan] || 'Plan Básico';

  // Oculta "Mejorar →" si ya es premium
  const badgeUpgrade = document.querySelector('.badge-upgrade');
  if (badgeUpgrade) {
    badgeUpgrade.style.display = State.plan === 'premium' ? 'none' : '';
  }

  // Actualiza botones de planes en el modal
  document.querySelectorAll('.btn-plan-sel').forEach(btn => {
    const p = btn.dataset.plan;
    if (p === State.plan) {
      btn.textContent = 'Plan actual ✓';
      btn.disabled = true;
    } else {
      const textos = { basico: 'Cambiar a Básico', pro: 'Activar Pro', premium: 'Activar Premium' };
      btn.textContent = textos[p] || 'Activar';
      btn.disabled = false;
    }
  });
}

function activarPlan(plan) {
  State.plan = plan;
  actualizarUIPlanes();
  actualizarLockUI();
  // Re-renderizar grids que dependen del plan
  if (typeof renderizarGridPlantillas === 'function') renderizarGridPlantillas();
  if (typeof renderizarFormatosBtns  === 'function') renderizarFormatosBtns();
  if (typeof renderizarFuentesGrid   === 'function') renderizarFuentesGrid();
  cerrarModalPlanes();
  if (typeof generarFlyer === 'function') generarFlyer();
}

function actualizarLockUI() {
  // Plantillas
  document.querySelectorAll('.plantilla-btn').forEach(btn => {
    const id = btn.dataset.plantilla;
    const perm = State.canUse('plantillas');
    if (Array.isArray(perm) && !perm.includes(id)) {
      btn.classList.add('locked');
    } else {
      btn.classList.remove('locked');
    }
  });

  // Formatos
  document.querySelectorAll('.formato-btn').forEach(btn => {
    const id = btn.dataset.formato;
    const perm = State.canUse('formatos');
    if (Array.isArray(perm) && !perm.includes(id)) {
      btn.classList.add('locked');
    } else {
      btn.classList.remove('locked');
    }
  });

  // Fuentes
  document.querySelectorAll('.fuente-btn').forEach(btn => {
    const id = btn.dataset.fuente;
    const perm = State.canUse('fuentes');
    if (Array.isArray(perm) && !perm.includes(id)) {
      btn.classList.add('locked');
    } else {
      btn.classList.remove('locked');
    }
  });

  // Campos con data-plan
  document.querySelectorAll('[data-plan]').forEach(el => {
    const planReq = el.dataset.plan;
    const planes = { basico: 0, pro: 1, premium: 2 };
    const reqLevel = planes[planReq] || 0;
    const curLevel = planes[State.plan] || 0;
    el.disabled = curLevel < reqLevel;
    if (el.disabled) el.title = `Requiere plan ${planReq.charAt(0).toUpperCase() + planReq.slice(1)}`;
    else el.title = '';
  });

  // Color acento
  const colorAcento = State.canUse('colorAcento');
  const campoAcento = document.getElementById('campo-color-acento');
  if (campoAcento) campoAcento.style.opacity = colorAcento ? '1' : '.45';
}

// Init event listeners del modal de planes
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-ver-planes').addEventListener('click', abrirModalPlanes);
  document.getElementById('modal-planes-close').addEventListener('click', cerrarModalPlanes);

  // Clicks en botones de plan
  document.querySelectorAll('.btn-plan-sel').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) {
        activarPlan(btn.dataset.plan);
      }
    });
  });

  // Cerrar al hacer click fuera
  document.getElementById('modal-planes').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrarModalPlanes();
  });

  actualizarUIPlanes();
});
