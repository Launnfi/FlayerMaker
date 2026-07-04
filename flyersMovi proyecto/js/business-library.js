/* ══════════════════════════════════════════════════════
   BUSINESS-LIBRARY.JS — Biblioteca de productos / servicios

   Cada negocio guarda UNA vez su catálogo. La biblioteca depende
   del RUBRO (business-types.js): cada rubro tiene su propia lista.

   Item:
     { id, nombre, categoria, descripcion, precio?, precioAnterior?,
       imagen?, etiquetas[], activo }

   Persistencia: localStorage (mismo patrón que Brand Kit).
     localStorage['flyerstudio_library'] = { [rubroId]: [item, ...] }

   API:
     getLibrary(rubroId?)        → items del rubro (o del rubro activo)
     saveLibrary(items, rubroId?)→ reemplaza la lista del rubro
     updateItem(item, rubroId?)  → upsert (crea id si falta)
     deleteItem(id, rubroId?)
     findItem(id, rubroId?)
     getLibraryActivos(rubroId?) → sólo los activos (para el asistente)

   Independiente del editor. NO toca render ni plantillas.
   ══════════════════════════════════════════════════════ */

const LIBRARY_KEY = 'flyerstudio_library';

// Modelo base de un item (defaults para campos nuevos).
const LIBRARY_ITEM_DEFAULT = {
  id:             '',
  nombre:         '',
  categoria:      '',
  descripcion:    '',
  precio:         '',
  precioAnterior: '',
  imagen:         '',   // dataURL o ''
  etiquetas:      [],
  activo:         true,
};

// Catálogo semilla por rubro (se usa si el negocio todavía no guardó nada).
const LIBRARY_SEED = {
  estetica: [
    { id: 'estetica-manicura',   nombre: 'Manicura',   categoria: 'Uñas',        descripcion: 'Manicura completa', precio: '$600' },
    { id: 'estetica-pedicura',   nombre: 'Pedicura',   categoria: 'Uñas',        descripcion: 'Pedicura spa',      precio: '$750' },
    { id: 'estetica-lifting',    nombre: 'Lifting',    categoria: 'Pestañas',    descripcion: 'Lifting de pestañas', precio: '$1.200' },
    { id: 'estetica-depilacion', nombre: 'Depilación', categoria: 'Depilación',  descripcion: 'Depilación con cera', precio: '$900' },
  ],
  restaurante: [
    { id: 'restaurante-pizza',      nombre: 'Pizza',      categoria: 'Comidas',  descripcion: 'Muzzarella a la piedra', precio: '$450' },
    { id: 'restaurante-hamburguesa',nombre: 'Hamburguesa',categoria: 'Comidas',  descripcion: 'Doble carne con papas',  precio: '$390' },
    { id: 'restaurante-refresco',   nombre: 'Refresco',   categoria: 'Bebidas',  descripcion: 'Línea de gaseosas',       precio: '$120' },
  ],
  veterinaria: [
    { id: 'veterinaria-vacunacion', nombre: 'Vacunación', categoria: 'Salud',    descripcion: 'Plan de vacunas', precio: '$800' },
    { id: 'veterinaria-bano',       nombre: 'Baño',       categoria: 'Estética', descripcion: 'Baño y secado',   precio: '$500' },
    { id: 'veterinaria-consulta',   nombre: 'Consulta',   categoria: 'Salud',    descripcion: 'Consulta clínica', precio: '$700' },
  ],
};

// ── Helpers de persistencia ──
function _libLoadAll() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {}; }
  catch { return {}; }
}
function _libSaveAll(all) {
  try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(all)); }
  catch (e) { console.warn('No se pudo guardar la biblioteca (¿storage lleno?):', e); }
}
function _rubroActivoId(rubroId) {
  return rubroId || (typeof RubroState !== 'undefined' ? RubroState.id : 'estetica');
}
function _normalizarItem(it) {
  return { ...LIBRARY_ITEM_DEFAULT, ...it,
    etiquetas: Array.isArray(it.etiquetas) ? it.etiquetas : [] };
}

// ── API ──
function getLibrary(rubroId) {
  const id  = _rubroActivoId(rubroId);
  const all = _libLoadAll();
  const base = all[id] || LIBRARY_SEED[id] || [];   // semilla si nunca guardó
  return base.map(_normalizarItem);
}

function saveLibrary(items, rubroId) {
  const id  = _rubroActivoId(rubroId);
  const all = _libLoadAll();
  all[id] = (items || []).map(_normalizarItem);
  _libSaveAll(all);
  return all[id];
}

function updateItem(item, rubroId) {
  const id    = _rubroActivoId(rubroId);
  const items = getLibrary(id);
  const it    = _normalizarItem(item);
  if (!it.id) it.id = 'it-' + Date.now().toString(36);

  const idx = items.findIndex(x => x.id === it.id);
  if (idx >= 0) items[idx] = it; else items.push(it);
  saveLibrary(items, id);
  return it;
}

function deleteItem(itemId, rubroId) {
  const id    = _rubroActivoId(rubroId);
  const items = getLibrary(id).filter(x => x.id !== itemId);
  saveLibrary(items, id);
  return items;
}

function findItem(itemId, rubroId) {
  return getLibrary(rubroId).find(x => x.id === itemId) || null;
}

function getLibraryActivos(rubroId) {
  return getLibrary(rubroId).filter(x => x.activo);
}

// ── Puente item → campos del asistente ──
// Mapea un item a los `name` de los campos de una campaña (heurística por nombre).
// Lo usa el asistente para autocompletar al elegir un servicio.
function itemAValores(item, campos) {
  const v = {};
  (campos || []).forEach(f => {
    const n = String(f.name).toLowerCase();
    if (/titulo|nombre/.test(n))          v[f.name] = item.nombre;
    else if (/anterior/.test(n))          v[f.name] = item.precioAnterior || '';
    else if (/precio|descuento/.test(n))  v[f.name] = item.precio || '';
    else if (/desc|servicios|mensaje/.test(n)) v[f.name] = item.descripcion || item.nombre;
  });
  return v;
}

// ══════════════════════════════════════════════════
//  UI — Modal de gestión de la biblioteca
// ══════════════════════════════════════════════════
let _libEditId = null;   // id del item en edición (null = nuevo)

function _crearModalLibrary() {
  if (document.getElementById('modal-library')) return;
  const overlay = document.createElement('div');
  overlay.id = 'modal-library';
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);' +
    'backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--surface,#1c1c22);border:1px solid var(--border,rgba(255,255,255,.12));
      border-radius:16px;width:100%;max-width:620px;max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:18px 22px;border-bottom:1px solid var(--border,rgba(255,255,255,.1))">
        <div>
          <div style="font-weight:700;font-size:17px">📚 Biblioteca</div>
          <div id="lib-sub" style="font-size:12px;opacity:.6;margin-top:2px"></div>
        </div>
        <button id="lib-cerrar" style="background:none;border:none;color:inherit;font-size:22px;cursor:pointer;opacity:.7">✕</button>
      </div>
      <div id="lib-body" style="padding:22px"></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarBiblioteca(); });
  document.getElementById('lib-cerrar').addEventListener('click', cerrarBiblioteca);
}

function _renderModalLibrary() {
  const body = document.getElementById('lib-body');
  const sub  = document.getElementById('lib-sub');
  if (!body) return;
  const rubro = (typeof getRubroActual === 'function') ? getRubroActual() : null;
  if (sub) sub.textContent = rubro ? `Rubro: ${rubro.nombre}` : '';

  const items = getLibrary();
  const ed    = _libEditId ? (findItem(_libEditId) || _normalizarItem({})) : _normalizarItem({});

  const lista = items.length ? items.map(it => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border,rgba(255,255,255,.1));
      border-radius:10px;margin-bottom:8px;${it.activo ? '' : 'opacity:.45'}">
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${it.nombre} ${it.precio ? `· <span style="opacity:.8">${it.precio}</span>` : ''}</div>
        <div style="font-size:12px;opacity:.6">${it.categoria || 'Sin categoría'}${it.descripcion ? ' — ' + it.descripcion : ''}</div>
      </div>
      <button data-lib-toggle="${it.id}" title="Activar/desactivar" style="background:none;border:1px solid var(--border,rgba(255,255,255,.2));border-radius:8px;cursor:pointer;color:inherit;padding:4px 8px;font-size:12px">${it.activo ? '✓' : '○'}</button>
      <button data-lib-edit="${it.id}" title="Editar" style="background:none;border:1px solid var(--border,rgba(255,255,255,.2));border-radius:8px;cursor:pointer;color:inherit;padding:4px 8px;font-size:12px">✎</button>
      <button data-lib-del="${it.id}" title="Eliminar" style="background:none;border:1px solid var(--border,rgba(255,255,255,.2));border-radius:8px;cursor:pointer;color:inherit;padding:4px 8px;font-size:12px">🗑</button>
    </div>`).join('') : `<p class="campo-hint">Todavía no hay ítems. Agregá el primero abajo.</p>`;

  body.innerHTML = `
    <div style="margin-bottom:18px">${lista}</div>
    <div style="border-top:1px solid var(--border,rgba(255,255,255,.1));padding-top:16px">
      <div class="seccion-titulo" style="margin-bottom:10px">${_libEditId ? 'Editar ítem' : 'Nuevo ítem'}</div>
      <div class="campo"><label>Nombre</label><input type="text" id="lib-nombre" value="${_esc(ed.nombre)}"></div>
      <div class="campo"><label>Categoría</label><input type="text" id="lib-categoria" value="${_esc(ed.categoria)}"></div>
      <div class="campo"><label>Descripción corta</label><input type="text" id="lib-descripcion" value="${_esc(ed.descripcion)}"></div>
      <div class="campo"><label>Precio <span class="label-opt">opcional</span></label><input type="text" id="lib-precio" value="${_esc(ed.precio)}"></div>
      <div class="campo"><label>Precio anterior <span class="label-opt">opcional</span></label><input type="text" id="lib-precioAnterior" value="${_esc(ed.precioAnterior)}"></div>
      <div class="campo"><label>Etiquetas <span class="label-opt">separadas por coma</span></label><input type="text" id="lib-etiquetas" value="${_esc((ed.etiquetas || []).join(', '))}"></div>
      <div class="campo"><label>Imagen <span class="label-opt">opcional</span></label><input type="file" id="lib-imagen" accept="image/*"></div>
      <div class="campo"><label><input type="checkbox" id="lib-activo" ${ed.activo ? 'checked' : ''}> Activo</label></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px">
        ${_libEditId ? `<button id="lib-cancelar" style="padding:9px 16px;border-radius:10px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.2));color:inherit;cursor:pointer">Cancelar</button>` : ''}
        <button id="lib-guardar" style="padding:9px 16px;border-radius:10px;background:var(--primary,#C4748A);border:1px solid var(--primary,#C4748A);color:#fff;font-weight:600;cursor:pointer">${_libEditId ? 'Guardar cambios' : 'Agregar'}</button>
      </div>
    </div>`;

  // dataURL temporal de imagen elegida
  let imgTmp = null;
  document.getElementById('lib-imagen')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => { imgTmp = r.result; }; r.readAsDataURL(file);
  });

  body.querySelectorAll('[data-lib-toggle]').forEach(b => b.addEventListener('click', () => {
    const it = findItem(b.dataset.libToggle); if (it) { it.activo = !it.activo; updateItem(it); _renderModalLibrary(); }
  }));
  body.querySelectorAll('[data-lib-edit]').forEach(b => b.addEventListener('click', () => { _libEditId = b.dataset.libEdit; _renderModalLibrary(); }));
  body.querySelectorAll('[data-lib-del]').forEach(b => b.addEventListener('click', () => {
    deleteItem(b.dataset.libDel); if (_libEditId === b.dataset.libDel) _libEditId = null; _renderModalLibrary();
  }));
  document.getElementById('lib-cancelar')?.addEventListener('click', () => { _libEditId = null; _renderModalLibrary(); });

  document.getElementById('lib-guardar')?.addEventListener('click', () => {
    const item = _normalizarItem({
      id:             _libEditId || '',
      nombre:         document.getElementById('lib-nombre').value.trim(),
      categoria:      document.getElementById('lib-categoria').value.trim(),
      descripcion:    document.getElementById('lib-descripcion').value.trim(),
      precio:         document.getElementById('lib-precio').value.trim(),
      precioAnterior: document.getElementById('lib-precioAnterior').value.trim(),
      etiquetas:      document.getElementById('lib-etiquetas').value.split(',').map(s => s.trim()).filter(Boolean),
      activo:         document.getElementById('lib-activo').checked,
      imagen:         imgTmp || (_libEditId ? (findItem(_libEditId)?.imagen || '') : ''),
    });
    if (!item.nombre) return;
    updateItem(item);
    _libEditId = null;
    _renderModalLibrary();
  });
}

function _esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

function abrirBiblioteca() {
  _crearModalLibrary();
  _libEditId = null;
  _renderModalLibrary();
  document.getElementById('modal-library').style.display = 'flex';
}
function cerrarBiblioteca() {
  const m = document.getElementById('modal-library');
  if (m) m.style.display = 'none';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-biblioteca')?.addEventListener('click', abrirBiblioteca);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('modal-library');
      if (m && m.style.display === 'flex') cerrarBiblioteca();
    }
  });
});
