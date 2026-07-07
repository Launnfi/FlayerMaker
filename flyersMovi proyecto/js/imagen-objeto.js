/* IMAGEN-OBJETO.JS — Imágenes como objetos arrastrables + integración.
   Reutiliza ElementosState + editor: un objeto-imagen es un elemento con tipo 'imagen'. */

if (typeof HITBOX !== 'undefined' && !HITBOX.imagen) {
  HITBOX.imagen = { w: 320, h: 320 };
}
const IMG_OBJETO_LADO = 320;
let _imgObjetoSeq = 0;

function agregarImagenObjeto(fileOrDataUrl, opts = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { w: W, h: H } = State.getCanvasSize();
      const id = 'img-' + (++_imgObjetoSeq);
      const el = {
        id, tipo: 'imagen', label: opts.label || 'Imagen ' + _imgObjetoSeq, img,
        x: opts.x ?? W / 2, y: opts.y ?? H / 2, escala: opts.escala ?? 1, rotacion: opts.rotacion ?? 0,
        tratamiento: {
          forma: opts.forma || 'rect', radio: opts.radio ?? 28,
          sombra: opts.sombra ?? true, marco: opts.marco ?? false, tinte: opts.tinte ?? 0,
        },
        _origX: opts.x ?? W / 2, _origY: opts.y ?? H / 2,
        _origEscala: opts.escala ?? 1, _origRotacion: opts.rotacion ?? 0,
      };
      ElementosState.elementos.push(el);
      ElementosState.seleccionado = id;
      if (typeof generarFlyer === 'function') generarFlyer();
      resolve(id);
    };
    img.onerror = () => resolve(null);
    if (typeof fileOrDataUrl === 'string') { img.src = fileOrDataUrl; }
    else { const r = new FileReader(); r.onload = (e) => { img.src = e.target.result; }; r.readAsDataURL(fileOrDataUrl); }
  });
}

function quitarImagenObjeto(id) {
  ElementosState.elementos = ElementosState.elementos.filter(e => e.id !== id);
  if (ElementosState.seleccionado === id) ElementosState.seleccionado = null;
  if (typeof generarFlyer === 'function') generarFlyer();
}
function listarImagenesObjeto() { return ElementosState.elementos.filter(e => e.tipo === 'imagen'); }

function dibujarImagenesObjeto(ctx, W, H) {
  const acento = document.getElementById('color-acento')?.value || '#D4A853';
  ElementosState.elementos.filter(e => e.tipo === 'imagen' && e.img).forEach(el => {
    const img = el.img;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const escalaBase = IMG_OBJETO_LADO / Math.max(iw, ih);
    const dw = iw * escalaBase, dh = ih * escalaBase, t = el.tratamiento || {};
    ctx.save();
    ctx.translate(el.x, el.y); ctx.rotate(el.rotacion || 0); ctx.scale(el.escala || 1, el.escala || 1);
    if (t.sombra) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; }
    ctx.beginPath();
    if (t.forma === 'circulo') { const r = Math.min(dw, dh) / 2; ctx.arc(0, 0, r, 0, Math.PI * 2); }
    else if (t.forma === 'redondeado') { pathRedondeado(ctx, -dw / 2, -dh / 2, dw, dh, t.radio ?? 28); }
    else { ctx.rect(-dw / 2, -dh / 2, dw, dh); }
    ctx.closePath(); ctx.save(); ctx.clip(); ctx.shadowColor = 'transparent';
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    if (t.tinte && t.tinte > 0) {
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = Math.min(1, t.tinte);
      ctx.fillStyle = acento; ctx.fillRect(-dw / 2, -dh / 2, dw, dh);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    if (t.marco) {
      ctx.strokeStyle = acento; ctx.lineWidth = 6; ctx.beginPath();
      if (t.forma === 'circulo') ctx.arc(0, 0, Math.min(dw, dh) / 2, 0, Math.PI * 2);
      else if (t.forma === 'redondeado') pathRedondeado(ctx, -dw / 2, -dh / 2, dw, dh, t.radio ?? 28);
      else ctx.rect(-dw / 2, -dh / 2, dw, dh);
      ctx.stroke();
    }
    ctx.restore();
  });
}
function pathRedondeado(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
}
function colorDominante(img) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, 16, 16);
    const { data } = cx.getImageData(0, 0, 16, 16);
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) { if (data[i + 3] < 128) continue; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    if (!n) return null;
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  } catch { return null; }
}
function armonizarConImagen(id) {
  const el = ElementosState.getById(id);
  if (!el || el.tipo !== 'imagen') return;
  const dom = colorDominante(el.img);
  if (dom) {
    const a = document.getElementById('color-acento'); if (a) a.value = dom;
    const at = document.getElementById('color-acento-txt'); if (at) at.value = dom;
  }
  el.tratamiento = { ...el.tratamiento, forma: 'redondeado', radio: 28, sombra: true, marco: true, tinte: 0.15 };
  if (typeof generarFlyer === 'function') generarFlyer();
  if (typeof mostrarToast === 'function') mostrarToast('✓ Imagen integrada a la paleta');
}

window.agregarImagenObjeto = agregarImagenObjeto;
window.quitarImagenObjeto = quitarImagenObjeto;
window.listarImagenesObjeto = listarImagenesObjeto;
window.dibujarImagenesObjeto = dibujarImagenesObjeto;
window.armonizarConImagen = armonizarConImagen;
window.colorDominante = colorDominante;
