/* TEMPLATE: NUEVO SERVICIO */
function dibujarNuevoServicio(ctx, W, H, d) {
  const nombre = document.getElementById('c-titulo')?.value||'Nuevo servicio';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const precio = document.getElementById('c-precio')?.value||'';
  const badge  = document.getElementById('c-badge')?.value ||'¡NUEVO!';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value||'#1A1018');

  dibujarFondoBase(ctx,W,H);
  const gd=ctx.createLinearGradient(0,0,W,H); gd.addColorStop(0,hexToRgba(d.colorP,.2)); gd.addColorStop(1,hexToRgba(colorA,.1));
  ctx.fillStyle=gd;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.08;ctx.beginPath();ctx.arc(W*.7,H*.4,W*.5,0,Math.PI*2);ctx.fillStyle=colorA;ctx.fill();ctx.restore();
  const bl2=ctx.createLinearGradient(0,0,0,H); bl2.addColorStop(0,colorA); bl2.addColorStop(1,d.colorP);
  ctx.fillStyle=bl2;ctx.fillRect(0,0,10,H);
  ctx.strokeStyle=hexToRgba(colorA,.5);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(60,H*.30);ctx.lineTo(W-60,H*.30);ctx.stroke();

  // Badge superior
  const pBadge=getPosEl('badge',W*.22,H*.10);
  ctx.save();ctx.translate(pBadge.x,pBadge.y);ctx.rotate(pBadge.rotacion);ctx.scale(pBadge.escala,pBadge.escala);
  ctx.font=`700 22px '${fBody}',sans-serif`;
  const bw=ctx.measureText(badge).width+60;
  roundRect(ctx,-bw/2,-26,bw,52,26);ctx.fillStyle=colorA;ctx.fill();
  ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(badge,0,0);ctx.restore();

  if(State.logoImg){
    const p=getPosEl('logo',W*.13,H*.22);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,90,'cuadrado');ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W*.38,H*.22,(ctx,m)=>{
    ctx.font=`700 36px '${fTitulo}',serif`;ctx.textAlign='left';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width,h=d.slogan?68:44;
    if(!m){ctx.fillStyle=textoColor;ctx.fillText(d.negocio,0,d.slogan?-16:0);
      if(d.slogan){ctx.fillStyle=d.colorP;ctx.font=`400 18px '${fBody}',sans-serif`;ctx.fillText(d.slogan,0,20);}
    }
    return {w,h};
  });

  ctx.fillStyle=hexToRgba(textoColor,.6);ctx.font=`400 22px '${fBody}',sans-serif`;
  ctx.textAlign='left';ctx.fillText('Presentamos:',60,H*.38);

  dibujarBloque(ctx,'titulo',W*.1,H*.52,(ctx,m)=>{
    const sz=H<700?54:70; const lh=H<700?66:82;
    ctx.font=`900 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=nombre.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=textoColor;lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  dibujarBloque(ctx,'descripcion',W*.1,H*.68,(ctx,m)=>{
    const sz=H<700?22:28; const lh=H<700?34:42;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=hexToRgba(textoColor,.75);lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh||sz+8};
  });

  if(precio){
    const pp=getPosEl('precio',W*.2,H*.82);
    ctx.save();ctx.translate(pp.x,pp.y);ctx.rotate(pp.rotacion);ctx.scale(pp.escala,pp.escala);
    ctx.font=`700 32px '${fTitulo}',serif`;const pw=ctx.measureText(precio).width+60;
    ctx.shadowColor=hexToRgba(colorA,.5);ctx.shadowBlur=20;
    roundRect(ctx,-pw/2,-35,pw,70,14);
    const gp=ctx.createLinearGradient(-pw/2,0,pw/2,0); gp.addColorStop(0,d.colorP); gp.addColorStop(1,colorA);
    ctx.fillStyle=gp;ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(precio,0,0);ctx.restore();
  }

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposNuevoServicio=`
  <div class="campo"><label>Nombre del servicio</label><input type="text" id="c-titulo" value="Lifting de pestañas"></div>
  <div class="campo"><label>Descripción</label><textarea id="c-desc">Efecto rizador natural\nDura hasta 8 semanas\nSin daño en tus pestañas</textarea></div>
  <div class="campo"><label>Precio <span class="label-opt">opcional</span></label><input type="text" id="c-precio" placeholder="Desde $1.800"></div>
  <div class="campo"><label>Badge superior</label><input type="text" id="c-badge" value="¡NUEVO!"></div>
`;
