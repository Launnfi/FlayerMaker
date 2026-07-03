/* TEMPLATE: FRASE */
function dibujarFrase(ctx, W, H, d) {
  const frase     = document.getElementById('c-frase')?.value    ||'';
  const subtitulo = document.getElementById('c-subtitulo')?.value||'';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value||'#1A1018');

  dibujarFondoBase(ctx,W,H);
  ctx.strokeStyle=hexToRgba(d.colorP,.05);ctx.lineWidth=1;
  for(let i=0;i<H;i+=28){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
  const gl=ctx.createLinearGradient(0,0,W,H);
  gl.addColorStop(0,hexToRgba(d.colorP,.18));gl.addColorStop(.5,'transparent');gl.addColorStop(1,hexToRgba(colorA,.12));
  ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=hexToRgba(colorA,.5);ctx.lineWidth=3;ctx.strokeRect(38,38,W-76,H-76);
  ctx.strokeStyle=hexToRgba(d.colorP,.25);ctx.lineWidth=1;ctx.strokeRect(52,52,W-104,H-104);
  const esq=(x,y,dx,dy)=>{ctx.strokeStyle=colorA;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y+dy*70);ctx.lineTo(x,y);ctx.lineTo(x+dx*70,y);ctx.stroke();};
  esq(58,58,1,1);esq(W-58,58,-1,1);esq(58,H-58,1,-1);esq(W-58,H-58,-1,-1);
  // Comillas decorativas de fondo
  ctx.fillStyle=hexToRgba(colorA,.12);ctx.font=`300 ${H<700?200:280}px '${fTitulo}',serif`;
  ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('\u201C',60,H*.18);
  ctx.textAlign='right';ctx.fillText('\u201D',W-60,H*.42);ctx.textBaseline='alphabetic';

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.14);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,96);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.24,(ctx,m)=>{
    ctx.font=`400 28px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio.toUpperCase()).width,h=40;
    if(!m){ctx.fillStyle=d.colorP;ctx.fillText(d.negocio.toUpperCase(),0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'frase',W/2,H*.50,(ctx,m)=>{
    const sz=H<700?52:68; const lh=sz+14;
    ctx.font=`700 italic ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=frase.replace(/["""]/g,'').split('\n').filter(Boolean);
    const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=textoColor;lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  if(subtitulo) dibujarBloque(ctx,'subtitulo',W/2,H*.72,(ctx,m)=>{
    const sz=H<700?22:28;ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(subtitulo).width,h=sz+8;
    if(!m){ctx.fillStyle=hexToRgba(textoColor,.7);ctx.fillText(subtitulo,0,0);}
    return {w,h};
  });

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposFrase=`
  <div class="campo"><label>Frase principal</label><textarea id="c-frase" style="min-height:90px">"La belleza\nes una forma\nde expresión"</textarea></div>
  <div class="campo"><label>Subtítulo <span class="label-opt">opcional</span></label><input type="text" id="c-subtitulo" value="Tu lugar de confianza"></div>
`;
