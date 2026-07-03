/* TEMPLATE: VERANO */
function dibujarVerano(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value||'¡Listo para el verano!';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const cta    = document.getElementById('c-cta')?.value   ||'¡Reservá ahora!';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  if(State.fondoActivo==='color'){const gv=ctx.createLinearGradient(0,0,W,H);gv.addColorStop(0,'#FF8C69');gv.addColorStop(.4,d.colorP);gv.addColorStop(1,'#5B4FBE');ctx.fillStyle=gv;ctx.fillRect(0,0,W,H);}
  else dibujarFondoBase(ctx,W,H);

  ctx.save();ctx.globalAlpha=.15;ctx.fillStyle=colorA;ctx.beginPath();ctx.arc(W*.78,H*.22,160,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.globalAlpha=.1;ctx.strokeStyle=colorA;ctx.lineWidth=3;
  for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;ctx.beginPath();ctx.moveTo(W*.78+Math.cos(a)*170,H*.22+Math.sin(a)*170);ctx.lineTo(W*.78+Math.cos(a)*240,H*.22+Math.sin(a)*240);ctx.stroke();}ctx.restore();
  ctx.save();ctx.fillStyle=hexToRgba('#FFF',.08);ctx.beginPath();ctx.moveTo(0,H*.8);
  for(let x=0;x<=W;x+=20)ctx.lineTo(x,H*.8+Math.sin((x/W)*Math.PI*4)*28);
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();ctx.restore();
  const bt=ctx.createLinearGradient(0,0,W,0); bt.addColorStop(0,hexToRgba('#FFF',.3)); bt.addColorStop(1,'transparent');
  ctx.fillStyle=bt;ctx.fillRect(0,0,W,8);

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.12);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,90);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.23,(ctx,m)=>{
    const sz=H<700?30:38; ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width;
    if(!m){ctx.fillStyle='#FFF';ctx.fillText(d.negocio,0,-20);ctx.font=`${H<700?40:52}px serif`;ctx.fillText('☀️',0,22);}
    return {w:Math.max(w,120),h:70};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.50,(ctx,m)=>{
    const sz=H<700?54:70; const lh=H<700?66:84;
    ctx.font=`900 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=titulo.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle='#FFF';lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  dibujarBloque(ctx,'descripcion',W/2,H*.65,(ctx,m)=>{
    const sz=H<700?22:28; const lh=H<700?34:42;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=hexToRgba('#FFF',.85);lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh||sz+8};
  });

  if(cta){
    const pc=getPosEl('cta',W/2,H*.79);
    ctx.save();ctx.translate(pc.x,pc.y);ctx.rotate(pc.rotacion);ctx.scale(pc.escala,pc.escala);
    const bw=Math.min(440,W-200),bh=H<700?56:68;
    ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=20;roundRect(ctx,-bw/2,-bh/2,bw,bh,bh/2);ctx.fillStyle='#FFF';ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle=d.colorP;ctx.font=`700 ${H<700?21:26}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(cta,0,0);ctx.restore();
  }

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposVerano=`
  <div class="campo"><label>Título</label><input type="text" id="c-titulo" value="¡Listo para el verano!"></div>
  <div class="campo"><label>Descripción</label><textarea id="c-desc">Depilación láser completa\nBronceado perfecto</textarea></div>
  <div class="campo"><label>CTA</label><input type="text" id="c-cta" value="¡Reservá ahora!"></div>
`;
