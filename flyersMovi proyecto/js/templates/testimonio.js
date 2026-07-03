/* TEMPLATE: TESTIMONIO */
function dibujarTestimonio(ctx, W, H, d) {
  const testimonio = document.getElementById('c-frase')?.value   ||'';
  const cliente    = document.getElementById('c-cliente')?.value ||'Cliente satisfecha';
  const servicio   = document.getElementById('c-servicio')?.value||'';
  const estrellas  = parseInt(document.getElementById('c-estrellas')?.value||'5');
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value||'#1A1018');

  dibujarFondoBase(ctx,W,H);
  const gf=ctx.createLinearGradient(0,0,W,H); gf.addColorStop(0,hexToRgba(d.colorP,.12)); gf.addColorStop(1,hexToRgba(colorA,.08));
  ctx.fillStyle=gf;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.06;ctx.beginPath();ctx.arc(W*.8,H*.2,W*.4,0,Math.PI*2);ctx.fillStyle=colorA;ctx.fill();ctx.restore();
  const bt=ctx.createLinearGradient(0,0,W,0); bt.addColorStop(0,d.colorP); bt.addColorStop(1,colorA);
  ctx.fillStyle=bt;ctx.fillRect(0,0,W,10);
  ctx.save();ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowBlur=40;
  roundRect(ctx,60,H*.26,W-120,H*.56,20);ctx.fillStyle=hexToRgba('#FFF',.08);ctx.fill();ctx.restore();
  ctx.strokeStyle=hexToRgba(d.colorP,.3);ctx.lineWidth=1.5;roundRect(ctx,60,H*.26,W-120,H*.56,20);ctx.stroke();
  ctx.fillStyle=hexToRgba(colorA,.08);ctx.font=`300 ${H<700?180:240}px '${fTitulo}',serif`;
  ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('\u201C',70,H*.22);ctx.textBaseline='alphabetic';

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.12);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,90);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.22,(ctx,m)=>{
    const sz=H<700?32:40; ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width,h=sz+8;
    if(!m){ctx.fillStyle=textoColor;ctx.fillText(d.negocio,0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'frase',W/2,H*.46,(ctx,m)=>{
    const sz=H<700?30:38; const lh=sz+12;
    ctx.font=`italic 400 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=testimonio.replace(/["""]/g,'').split('\n').filter(Boolean);
    const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    const totalH=(lines.length-1)*lh;
    if(!m){
      ctx.fillStyle=textoColor;lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));
      ctx.fillStyle=colorA;ctx.font=`${H<700?28:34}px serif`;
      ctx.fillText('★'.repeat(estrellas)+'☆'.repeat(5-estrellas),0,totalH/2+50);
    }
    return {w:mW,h:lines.length*lh+60};
  });

  dibujarBloque(ctx,'cliente',W/2,H*.72,(ctx,m)=>{
    ctx.font=`600 ${H<700?22:26}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(cliente).width,h=servicio?54:34;
    if(!m){
      ctx.strokeStyle=hexToRgba(d.colorP,.4);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(-100,-16);ctx.lineTo(100,-16);ctx.stroke();
      ctx.fillStyle=d.colorP;ctx.fillText(cliente,0,0);
      if(servicio){ctx.fillStyle=hexToRgba(textoColor,.55);ctx.font=`400 ${H<700?17:20}px '${fBody}',sans-serif`;ctx.fillText(servicio,0,28);}
    }
    return {w,h};
  });

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposTestimonio=`
  <div class="campo"><label>Testimonio</label><textarea id="c-frase" style="min-height:110px">"Increíble atención, quedé\nencantada con el resultado.\n¡100% lo recomiendo!"</textarea></div>
  <div class="campo"><label>Cliente</label><input type="text" id="c-cliente" value="María González"></div>
  <div class="campo"><label>Servicio <span class="label-opt">opcional</span></label><input type="text" id="c-servicio" placeholder="Depilación láser"></div>
  <div class="campo"><label>Calificación</label><select id="c-estrellas"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option></select></div>
`;
