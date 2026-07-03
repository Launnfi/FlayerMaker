/* TEMPLATE: NAVIDAD */
function dibujarNavidad(ctx, W, H, d) {
  const titulo = document.getElementById('c-titulo')?.value||'¡Felices Fiestas!';
  const desc   = document.getElementById('c-desc')?.value  ||'';
  const saludo = document.getElementById('c-saludo')?.value||'De parte del equipo';
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';

  dibujarFondoBase(ctx,W,H);
  const gf=ctx.createLinearGradient(0,0,W,H); gf.addColorStop(0,hexToRgba(d.colorP,.15)); gf.addColorStop(1,hexToRgba(colorA,.1));
  ctx.fillStyle=gf;ctx.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){const sx=(i*137+50)%W,sy=(i*97+80)%H;ctx.fillStyle=hexToRgba(colorA,.15+(i%3)*.1);ctx.beginPath();ctx.arc(sx,sy,1.5+(i%3),0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=hexToRgba(colorA,.55);ctx.lineWidth=4;ctx.strokeRect(36,36,W-72,H-72);
  const dS=(x,y,dx,dy)=>{ctx.strokeStyle=hexToRgba(colorA,.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,H*.30);ctx.lineTo(W/2-30,H*.30);ctx.stroke();ctx.beginPath();ctx.moveTo(W/2+30,H*.30);ctx.lineTo(W-80,H*.30);ctx.stroke();};
  dS();ctx.fillStyle=colorA;ctx.font='24px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',W/2,H*.30);
  const drawSprig=(x,y,flip)=>{ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.fillStyle='#2D6B3A';ctx.beginPath();for(let k=0;k<3;k++){ctx.moveTo(0,-k*18);ctx.lineTo(-18+k*6,-k*18+16);ctx.lineTo(18-k*6,-k*18+16);ctx.closePath();}ctx.fill();ctx.fillStyle=colorA;ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#CC2222';ctx.beginPath();ctx.arc(12,-10,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-10,-22,4,0,Math.PI*2);ctx.fill();ctx.restore();};
  drawSprig(80,H-80,false);drawSprig(W-80,H-80,true);
  ctx.font=`${H<700?34:42}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🎄  ⭐  🎁',W/2,H-120);ctx.textBaseline='alphabetic';

  if(State.logoImg){
    const p=getPosEl('logo',W/2,H*.13);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    ctx.save();ctx.strokeStyle=colorA;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,66,0,Math.PI*2);ctx.stroke();ctx.restore();
    dibujarLogo(ctx,State.logoImg,0,0,120);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W/2,H*.26,(ctx,m)=>{
    const sz=H<700?32:42; ctx.font=`700 ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width,h=sz+8;
    if(!m){ctx.fillStyle=colorA;ctx.fillText(d.negocio,0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.48,(ctx,m)=>{
    const sz=H<700?54:70; const lh=H<700?66:84;
    ctx.font=`700 italic ${sz}px '${fTitulo}',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=titulo.split('\n'); const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){ctx.fillStyle='#FFF';lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));}
    return {w:mW,h:lines.length*lh};
  });

  dibujarBloque(ctx,'descripcion',W/2,H*.65,(ctx,m)=>{
    const sz=H<700?22:28; const lh=H<700?34:42;
    ctx.font=`400 ${sz}px '${fBody}',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=[...desc.split('\n').filter(Boolean),`— ${saludo}`];
    const mW=Math.max(...lines.map(l=>ctx.measureText(l).width),1);
    if(!m){
      ctx.fillStyle=hexToRgba('#FFF',.8);
      lines.slice(0,-1).forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh));
      ctx.fillStyle=d.colorP;ctx.font=`400 italic ${sz}px '${fBody}',sans-serif`;
      ctx.fillText(lines[lines.length-1],0,(lines.length-1-(lines.length-1)/2)*lh);
    }
    return {w:mW,h:lines.length*lh};
  });

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposNavidad=`
  <div class="campo"><label>Saludo principal</label><input type="text" id="c-titulo" value="¡Felices Fiestas!"></div>
  <div class="campo"><label>Mensaje <span class="label-opt">opcional</span></label><textarea id="c-desc">Gracias por elegirnos\neste año</textarea></div>
  <div class="campo"><label>Firma</label><input type="text" id="c-saludo" value="De parte del equipo"></div>
`;
