/* TEMPLATE: DÍA DE LA MADRE */
function dibujarDiaMadre(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value||'¡Feliz Día Mamá!';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const oferta = document.getElementById('c-precio')?.value||'';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  if(State.fondoActivo==='color'){const{r,g,b}=hexToRgb(d.colorP);ctx.fillStyle=`rgb(${Math.min(255,r+115)},${Math.min(255,g+90)},${Math.min(255,b+100)})`;ctx.fillRect(0,0,W,H);}
  else dibujarFondoBase(ctx,W,H);

  const dP=(cx,cy,sz,ang)=>{ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.fillStyle=hexToRgba(d.colorP,.18);ctx.beginPath();ctx.ellipse(0,-sz/2,sz/3,sz/2,0,0,Math.PI*2);ctx.fill();ctx.restore();};
  for(let i=0;i<8;i++){dP(W*.15,H*.2,120,i*Math.PI/4);dP(W*.88,H*.82,100,i*Math.PI/4);dP(W*.05,H*.75,80,i*Math.PI/4);dP(W*.95,H*.15,80,i*Math.PI/4);}
  const dF=(cx,cy,sz,col)=>{for(let p=0;p<5;p++){const a=(p/5)*Math.PI*2;ctx.fillStyle=hexToRgba(col,.5);ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*sz*.6,cy+Math.sin(a)*sz*.6,sz*.5,sz*.3,a,0,Math.PI*2);ctx.fill();}ctx.fillStyle=colorA;ctx.beginPath();ctx.arc(cx,cy,sz*.3,0,Math.PI*2);ctx.fill();};
  dF(80,80,45,d.colorP);dF(W-80,80,40,colorA);dF(80,H-80,35,d.colorP);dF(W-80,H-80,45,colorA);

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.16);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    ctx.save();ctx.strokeStyle=d.colorP;ctx.lineWidth=3;ctx.setLineDash([8,4]);ctx.beginPath();ctx.arc(0,0,70,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    dibujarLogo(ctx,State.logoImg,0,0,120);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.28,(ctx,m)=>{
    const sz=H<700?30:38; ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width;
    if(!m){ctx.fillStyle=d.colorP;ctx.fillText(d.negocio,0,-20);ctx.font=`${H<700?28:36}px serif`;ctx.fillText('🌸 💐 🌸',0,20);}
    return {w:Math.max(w,200),h:70};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.50,(ctx,m)=>{
    const sz=H<700?54:68; const lh=H<700?66:82;
    ctx.font=`700 italic ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=titulo.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=darken(d.colorP,30);lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  dibujarBloque(ctx,'descripcion',W/2,H*.66,(ctx,m)=>{
    const sz=H<700?22:28; const lh=H<700?34:42;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=desc.split('\n').filter(Boolean); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle=hexToRgba('#3A2030',.8);lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh||sz+8};
  });

  if(oferta){
    const po=getPosEl('oferta',W/2,H*.80);
    ctx.save();ctx.translate(po.x,po.y);ctx.rotate(po.rotacion);ctx.scale(po.escala,po.escala);
    ctx.font=`700 ${H<700?22:26}px '${fBody}',sans-serif`;const ow=ctx.measureText(oferta).width+70;
    ctx.shadowColor=hexToRgba(d.colorP,.4);ctx.shadowBlur=20;roundRect(ctx,-ow/2,-32,ow,64,32);
    const go=ctx.createLinearGradient(-ow/2,0,ow/2,0); go.addColorStop(0,d.colorP); go.addColorStop(1,colorA);
    ctx.fillStyle=go;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(oferta,0,0);ctx.restore();
  }

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposDiaMadre=`
  <div class="campo"><label>Título</label><input type="text" id="c-titulo" value="¡Feliz Día Mamá!"></div>
  <div class="campo"><label>Mensaje</label><textarea id="c-desc">Celebrá con un momento\nde bienestar y belleza</textarea></div>
  <div class="campo"><label>Oferta <span class="label-opt">opcional</span></label><input type="text" id="c-precio" placeholder="20% OFF todo el mes"></div>
`;
