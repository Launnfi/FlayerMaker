/* TEMPLATE: OFERTA FLASH */
function dibujarOfertaFlash(ctx, W, H, d) {
  const titulo    = document.getElementById('c-titulo')?.value ||'OFERTA FLASH';
  const desc      = document.getElementById('c-desc')?.value   ||'';
  const descuento = document.getElementById('c-precio')?.value ||'50% OFF';
  const hasta     = document.getElementById('c-hasta')?.value  ||'Solo hoy';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  dibujarFondoBase(ctx,W,H);
  if(State.fondoActivo!=='color'){ctx.fillStyle=hexToRgba(d.colorP,.55);ctx.fillRect(0,0,W,H);}
  const steps=14;
  ctx.fillStyle=d.colorP;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.lineTo(W,H*.31);
  for(let i=steps;i>=0;i--)ctx.lineTo((i/steps)*W,H*.31+(i%2===0?-28:28));
  ctx.lineTo(0,H*.31);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,H);ctx.lineTo(W,H*.73);
  for(let i=steps;i>=0;i--)ctx.lineTo((i/steps)*W,H*.73+(i%2===0?28:-28));
  ctx.lineTo(0,H*.73);ctx.closePath();ctx.fill();

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.12);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,90);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.24,(ctx,m)=>{
    const sz=H<700?32:42; ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width,h=sz+8;
    if(!m){ctx.fillStyle='#FFF';ctx.fillText(d.negocio,0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.42,(ctx,m)=>{
    ctx.font=`400 26px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(titulo.toUpperCase()).width,h=34;
    if(!m){ctx.fillStyle='#FFF';ctx.fillText(titulo.toUpperCase(),0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'descuento',W/2,H*.54,(ctx,m)=>{
    const sz=H<700?78:108; ctx.font=`900 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(descuento).width,h=sz+10;
    if(!m){ctx.fillStyle=colorA;ctx.fillText(descuento,0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'hasta',W/2,H*.74,(ctx,m)=>{
    ctx.font=`700 22px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const tw=ctx.measureText(hasta).width;
    if(!m){
      roundRect(ctx,-(tw+60)/2,-26,tw+60,52,26);ctx.fillStyle=colorA;ctx.fill();
      ctx.fillStyle='#FFF';ctx.fillText(hasta,0,0);
    }
    return {w:tw+60,h:52};
  });

  if(desc) dibujarBloque(ctx,'descripcion',W/2,H*.85,(ctx,m)=>{
    const sz=24; const lh=36; ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle='#FFF';lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposOfertaFlash=`
  <div class="campo"><label>Título</label><input type="text" id="c-titulo" value="OFERTA FLASH"></div>
  <div class="campo"><label>Descuento</label><input type="text" id="c-precio" value="50% OFF"></div>
  <div class="campo"><label>Duración</label><input type="text" id="c-hasta" value="Solo hoy"></div>
  <div class="campo"><label>Descripción <span class="label-opt">opcional</span></label><textarea id="c-desc">En todos los servicios\n¡Reservá ahora!</textarea></div>
`;
