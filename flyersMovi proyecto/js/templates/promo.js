/* TEMPLATE: PROMO */
function dibujarPromo(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value || '';
  const desc   = document.getElementById('c-desc')?.value   || '';
  const precio = document.getElementById('c-precio')?.value || '';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA     = d.acento || '#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value || '#1A1018');

  dibujarFondoBase(ctx, W, H);
  const grad = ctx.createRadialGradient(W*.75,H*.25,0,W*.75,H*.25,W*.6);
  grad.addColorStop(0, hexToRgba(d.colorP,.25)); grad.addColorStop(1,'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);
  const lt = ctx.createLinearGradient(0,0,W,0);
  lt.addColorStop(0,'transparent'); lt.addColorStop(.4,d.colorP); lt.addColorStop(.6,colorA); lt.addColorStop(1,'transparent');
  ctx.fillStyle = lt; ctx.fillRect(0,0,W,8);

  if (State.logoImg) {
    const p = getPosEl('logo',W/2,H*.14);
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotacion); ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx, State.logoImg, 0, 0, 130); ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.30,(ctx,m)=>{
    const sz=H<700?38:52; ctx.font=`700 ${sz}px '${fTitulo}',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width, h=sz+8;
    if(!m){ctx.fillStyle=textoColor; ctx.fillText(d.negocio,0,0);}
    return {w,h};
  });

  if(d.slogan) dibujarBloque(ctx,'slogan',W/2,H*.36,(ctx,m)=>{
    const sz=H<700?20:26; ctx.font=`400 ${sz}px '${fBody}',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const w=ctx.measureText(d.slogan).width, h=sz+6;
    if(!m){ctx.fillStyle=d.colorP; ctx.fillText(d.slogan,0,0);}
    return {w,h};
  });

  if(precio){
    const p=getPosEl('badge',W*.73,H*.56); const pr=H<700?110:150;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotacion); ctx.scale(p.escala,p.escala);
    ctx.shadowColor=hexToRgba(d.colorP,.5); ctx.shadowBlur=30;
    ctx.beginPath(); ctx.arc(0,0,pr,0,Math.PI*2);
    const gc=ctx.createRadialGradient(-pr*.3,-pr*.3,0,0,0,pr);
    gc.addColorStop(0,lighten(d.colorP,30)); gc.addColorStop(1,darken(d.colorP,20));
    ctx.fillStyle=gc; ctx.fill(); ctx.shadowBlur=0;
    const pSz=precio.length>6?(H<700?42:58):(H<700?62:84);
    ctx.fillStyle='#FFF'; ctx.font=`900 ${pSz}px '${fTitulo}',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(precio,0,0); ctx.restore();
  }

  dibujarBloque(ctx,'titulo',W*.08,H*.52,(ctx,m)=>{
    const sz=H<700?46:64; ctx.font=`700 ${sz}px '${fTitulo}',serif`; ctx.textAlign='left'; ctx.textBaseline='middle';
    const lines=titulo.split('\n').filter(Boolean); const lh=sz+14;
    const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1), mH=lines.length*lh;
    if(!m){ctx.fillStyle=textoColor; lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:mH};
  });

  dibujarBloque(ctx,'descripcion',W*.08,H*.72,(ctx,m)=>{
    const sz=H<700?24:30; ctx.font=`400 ${sz}px '${fBody}',sans-serif`; ctx.textAlign='left'; ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const lh=sz+14;
    const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1), mH=lines.length*lh;
    if(!m){ctx.fillStyle=hexToRgba(textoColor,.75); lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:mH};
  });

  dibujarFooter(ctx, W, H, d, fBody);
}

const camposPromo = `
  <div class="campo"><label>Título de la promo</label>
    <input type="text" id="c-titulo" value="30% OFF"></div>
  <div class="campo"><label>Descripción</label>
    <textarea id="c-desc">Válido todo el mes\n¡Aprovechá ahora!</textarea></div>
  <div class="campo"><label>Descuento / badge</label>
    <input type="text" id="c-precio" value="30% OFF"></div>
`;
