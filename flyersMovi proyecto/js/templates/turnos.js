/* TEMPLATE: TURNOS */
function dibujarTurnos(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value||'¡Turnos disponibles!';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const cta    = document.getElementById('c-cta')?.value   ||'';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  const {r,g,b}=hexToRgb(d.colorP);
  ctx.fillStyle=`rgb(${Math.min(255,r+100)},${Math.min(255,g+85)},${Math.min(255,b+90)})`;
  ctx.fillRect(0,0,W,H);
  if(State.fondoActivo!=='color')dibujarFondoBase(ctx,W,H);
  const g1=ctx.createRadialGradient(180,180,0,180,180,380); g1.addColorStop(0,hexToRgba(d.colorP,.35)); g1.addColorStop(1,'transparent'); ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
  const g2=ctx.createRadialGradient(W-180,H-180,0,W-180,H-180,450); g2.addColorStop(0,hexToRgba(colorA,.2)); g2.addColorStop(1,'transparent'); ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=50;ctx.shadowOffsetY=16;
  roundRect(ctx,70,H*.19,W-140,H*.58,28);ctx.fillStyle='#FFF';ctx.fill();ctx.restore();
  ctx.save(); roundRect(ctx,70,H*.19,W-140,80,28);
  const gh=ctx.createLinearGradient(70,0,W-70,0); gh.addColorStop(0,d.colorP); gh.addColorStop(1,colorA);
  ctx.fillStyle=gh;ctx.fill();ctx.restore();

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.10);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,110);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.22,(ctx,m)=>{
    const sz=H<700?30:40; ctx.font=`700 ${sz}px '${fTitulo}',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width, h=sz+8;
    if(!m){ctx.fillStyle=d.colorP; ctx.fillText(d.negocio,0,0);}
    return {w,h};
  });

  ctx.font='52px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFF';
  ctx.fillText('📅',W/2,H*.19+40);

  dibujarBloque(ctx,'titulo',W/2,H*.50,(ctx,m)=>{
    const sz=H<700?52:66; const lh=H<700?64:80;
    ctx.font=`900 ${sz}px '${fTitulo}',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const lines=titulo.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=d.colorP; lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW, h:lines.length*lh};
  });

  dibujarBloque(ctx,'descripcion',W/2,H*.63,(ctx,m)=>{
    const sz=H<700?24:30; const lh=H<700?36:44;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle='#5A4A50'; lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW, h:lines.length*lh||sz+8};
  });

  if(cta){
    const pos=getPosEl('cta',W/2,H*.74);
    ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(pos.rotacion);ctx.scale(pos.escala,pos.escala);
    const bw=Math.min(480,W-200),bh=H<700?60:72;
    ctx.shadowColor=hexToRgba(d.colorP,.5);ctx.shadowBlur=24;
    roundRect(ctx,-bw/2,-bh/2,bw,bh,bh/2);
    const gc=ctx.createLinearGradient(-bw/2,0,bw/2,0); gc.addColorStop(0,d.colorP); gc.addColorStop(1,colorA);
    ctx.fillStyle=gc;ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#FFF';ctx.font=`600 ${H<700?24:28}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(cta,0,0);ctx.restore();
  }

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposTurnos=`
  <div class="campo"><label>Título</label><input type="text" id="c-titulo" value="¡Turnos disponibles!"></div>
  <div class="campo"><label>Mensaje</label><textarea id="c-desc">Esta semana tenemos\nlugares disponibles\n¡No te quedes sin el tuyo!</textarea></div>
  <div class="campo"><label>Llamado a la acción</label><input type="text" id="c-cta" value="Escribinos al WhatsApp"></div>
`;
