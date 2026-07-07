/* TEMPLATE: LUXURY */
function dibujarLuxury(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value||'Experiencia Premium';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const precio = document.getElementById('c-precio')?.value||'';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  dibujarFondoBase(ctx,W,H);
  ctx.save();ctx.strokeStyle=hexToRgba(colorA,.04);ctx.lineWidth=1;
  for(let i=-H;i<W+H;i+=30){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}ctx.restore();
  const gc=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.7); gc.addColorStop(0,hexToRgba(colorA,.06)); gc.addColorStop(1,'transparent');
  ctx.fillStyle=gc;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=colorA;ctx.lineWidth=2;ctx.strokeRect(30,30,W-60,H-60);
  ctx.strokeStyle=hexToRgba(colorA,.3);ctx.lineWidth=1;ctx.strokeRect(42,42,W-84,H-84);
  const orn=(x,y,dx,dy)=>{ctx.strokeStyle=colorA;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+dx*80,y);ctx.lineTo(x,y);ctx.lineTo(x,y+dy*80);ctx.stroke();ctx.save();ctx.translate(x+dx*30,y+dy*30);ctx.rotate(Math.PI/4);ctx.strokeStyle=hexToRgba(colorA,.7);ctx.lineWidth=1.5;ctx.strokeRect(-8,-8,16,16);ctx.restore();};
  orn(48,48,1,1);orn(W-48,48,-1,1);orn(48,H-48,1,-1);orn(W-48,H-48,-1,-1);
  ctx.strokeStyle=hexToRgba(colorA,.4);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(80,H*.32);ctx.lineTo(W/2-22,H*.32);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W/2+22,H*.32);ctx.lineTo(W-80,H*.32);ctx.stroke();
  ctx.fillStyle=colorA;ctx.font='16px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',W/2,H*.32);ctx.textBaseline='alphabetic';

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.15);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    ctx.save();ctx.shadowColor=hexToRgba(colorA,.6);ctx.shadowBlur=30;ctx.strokeStyle=colorA;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,66,0,Math.PI*2);ctx.stroke();ctx.restore();
    dibujarLogo(ctx,State.logoImg,0,0,120);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.28,(ctx,m)=>{
    const sz=H<700?17:21; const sp=H<700?9:11;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const neg=d.negocio.toUpperCase();const tw=neg.length*sp;
    if(!m){ctx.fillStyle=colorA;let lx=-tw/2+sp/2;for(const ch of neg){ctx.fillText(ch,lx,0);lx+=sp;}}
    return {w:tw,h:sz+8};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.50,(ctx,m)=>{
    const sz=H<700?50:66; const lh=H<700?62:80;
    ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=envolverLineas(ctx, titulo, W*0.86); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle='#FFF';lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  if(desc) dibujarBloque(ctx,'descripcion',W/2,H*.66,(ctx,m)=>{
    const sz=H<700?21:27; const lh=H<700?34:42;
    ctx.font=`300 italic ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=envolverLineas(ctx, desc, W*0.86).filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=hexToRgba('#FFF',.65);lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh||sz+8};
  });

  if(precio) dibujarBloque(ctx,'precio',W/2,H*.78,(ctx,m)=>{
    const sz=H<700?27:34; ctx.font=`600 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(precio).width,h=sz+8;
    if(!m){ctx.fillStyle=colorA;ctx.fillText(precio,0,0);}
    return {w,h};
  });

  const partes=[];if(d.tel)partes.push(`☎ ${d.tel}`);if(d.ig)partes.push(d.ig);if(d.dir)partes.push(d.dir);
  if(partes.length){ctx.strokeStyle=hexToRgba(colorA,.3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,H-90);ctx.lineTo(W-80,H-90);ctx.stroke();ctx.fillStyle=hexToRgba(colorA,.8);ctx.font=`400 ${H<700?17:21}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(partes.join('   ·   '),W/2,H-58);ctx.textBaseline='alphabetic';}
}

const camposLuxury=`
  <div class="campo"><label>Título</label><textarea id="c-titulo">Experiencia\nPremium</textarea></div>
  <div class="campo"><label>Descripción <span class="label-opt">opcional</span></label><textarea id="c-desc">La experiencia más exclusiva\ndiseñada para vos</textarea></div>
  <div class="campo"><label>Precio <span class="label-opt">opcional</span></label><input type="text" id="c-precio" placeholder="Desde $3.500"></div>
`;
