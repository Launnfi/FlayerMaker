/* TEMPLATE: MINIMALISTA */
function dibujarMinimalista(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value   ||'';
  const subtxt = document.getElementById('c-subtitulo')?.value||'';
  const cta    = document.getElementById('c-cta')?.value      ||'';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value||'#1A1018');

  dibujarFondoBase(ctx,W,H);
  ctx.fillStyle=colorA;ctx.fillRect(60,H*.15,2,H*.7);
  const lt=ctx.createLinearGradient(80,0,W-80,0); lt.addColorStop(0,'transparent'); lt.addColorStop(.3,colorA); lt.addColorStop(1,'transparent');
  ctx.fillStyle=lt;ctx.fillRect(80,H*.15,W-160,1);ctx.fillRect(80,H*.85,W-160,1);
  ctx.fillStyle=d.colorP;ctx.beginPath();ctx.arc(62,H*.15,5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(62,H*.85,5,0,Math.PI*2);ctx.fill();

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.26);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,100,'cuadrado');ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.38,(ctx,m)=>{
    const sz=H<700?20:26; const sp=H<700?9:11;
    ctx.font=`300 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const neg=d.negocio.toUpperCase();const tw=neg.length*sp;
    if(!m){let lx=-tw/2+sp/2;for(const ch of neg){ctx.fillStyle=textoColor;ctx.fillText(ch,lx,0);lx+=sp;}}
    return {w:tw,h:sz+8};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.52,(ctx,m)=>{
    const sz=H<700?50:66; const lh=H<700?62:80;
    ctx.font=`300 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=titulo.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=textoColor;lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  if(subtxt) dibujarBloque(ctx,'subtitulo',W/2,H*.64,(ctx,m)=>{
    const sz=H<700?20:24; ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(subtxt).width,h=sz+8;
    if(!m){ctx.fillStyle=d.colorP;ctx.fillText(subtxt,0,0);}
    return {w,h};
  });

  if(cta) dibujarBloque(ctx,'cta',W/2,H*.78,(ctx,m)=>{
    const sz=H<700?19:23; ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(cta).width,h=sz+8;
    if(!m){ctx.fillStyle=textoColor;ctx.fillText(cta,0,0);ctx.strokeStyle=colorA;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-w/2,10);ctx.lineTo(w/2,10);ctx.stroke();}
    return {w,h};
  });

  const partes=[];if(d.tel)partes.push(d.tel);if(d.ig)partes.push(d.ig);if(d.dir)partes.push(d.dir);
  if(partes.length){ctx.fillStyle=hexToRgba(textoColor,.4);ctx.font=`300 ${H<700?16:19}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(partes.join('  ·  '),W/2,H-55);ctx.textBaseline='alphabetic';}
}

const camposMinimalista=`
  <div class="campo"><label>Título</label><textarea id="c-titulo">Belleza\nsin límites</textarea></div>
  <div class="campo"><label>Subtexto <span class="label-opt">opcional</span></label><input type="text" id="c-subtitulo" placeholder="Servicio exclusivo"></div>
  <div class="campo"><label>CTA <span class="label-opt">opcional</span></label><input type="text" id="c-cta" placeholder="Reservar turno →"></div>
`;
