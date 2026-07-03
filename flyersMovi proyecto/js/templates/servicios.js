/* TEMPLATE: SERVICIOS */
function dibujarServicios(ctx, W, H, d) {
  const titulo    = document.getElementById('c-titulo')?.value    || 'Nuestros servicios';
  const servicios = (document.getElementById('c-servicios')?.value||'').split('\n').filter(Boolean);
  const { titulo: fTitulo, body: fBody } = getFuente();
  const colorA = d.acento||'#D4A853';
  const textoColor = contrasteTexto(document.getElementById('color-fondo')?.value||'#1A1018');

  dibujarFondoBase(ctx,W,H);
  ctx.fillStyle=hexToRgba(d.colorP,.08);
  for(let x=0;x<W;x+=40)for(let y=0;y<H;y+=40){ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();}
  const bl=ctx.createLinearGradient(0,0,0,H); bl.addColorStop(0,d.colorP); bl.addColorStop(1,colorA);
  ctx.fillStyle=bl; ctx.fillRect(0,0,14,H);
  ctx.save();ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(W,0,350,0,Math.PI*2);ctx.fillStyle=d.colorP;ctx.fill();ctx.restore();

  if(State.logoImg){
    const p=getPosEl('logo',W*.13,H*.13);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotacion);ctx.scale(p.escala,p.escala);
    dibujarLogo(ctx,State.logoImg,0,0,100);ctx.restore();
  }

  dibujarBloque(ctx,'negocio',W*.42,H*.13,(ctx,m)=>{
    ctx.font=`700 42px '${fTitulo}',serif`; ctx.textAlign='left'; ctx.textBaseline='middle';
    const w=ctx.measureText(d.negocio).width+( d.slogan?0:0), h=d.slogan?76:46;
    if(!m){
      ctx.fillStyle=textoColor; ctx.fillText(d.negocio,0,d.slogan?-16:0);
      if(d.slogan){ctx.fillStyle=d.colorP;ctx.font=`400 20px '${fBody}',sans-serif`;ctx.fillText(d.slogan,0,20);}
    }
    return {w:Math.max(w, d.slogan?ctx.measureText(d.slogan).width:0)+10, h};
  });

  dibujarBloque(ctx,'titulo',W/2,H*.30,(ctx,m)=>{
    const sz=H<700?54:68; ctx.font=`900 ${sz}px '${fTitulo}',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const w=ctx.measureText(titulo).width, h=sz+10;
    if(!m){ctx.fillStyle=colorA; ctx.fillText(titulo,0,0);}
    return {w,h};
  });

  dibujarBloque(ctx,'lista',W*.12,H*.44,(ctx,m)=>{
    const sz=H<700?24:30; const lh=H<700?60:74;
    ctx.font=`500 ${sz}px '${fBody}',sans-serif`; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    const col1=servicios.slice(0,Math.ceil(servicios.length/2));
    const col2=servicios.slice(Math.ceil(servicios.length/2));
    const colW=(W-220)/2;
    const mW=colW*2+40; const mH=Math.max(col1.length,col2.length)*lh;
    if(!m){
      const draw=(lista,ox)=>{lista.forEach((s,i)=>{
        const iy=i*lh;
        ctx.save(); roundRect(ctx,ox-8,iy-sz+2,colW,sz+14,8); ctx.fillStyle=hexToRgba(d.colorP,.1); ctx.fill(); ctx.restore();
        ctx.fillStyle=d.colorP; ctx.beginPath(); ctx.arc(ox+12,iy-8,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#FFF'; ctx.font=`400 10px 'DM Sans',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('✓',ox+12,iy-8);
        ctx.fillStyle=textoColor; ctx.font=`500 ${sz}px '${fBody}',sans-serif`; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
        ctx.fillText(s,ox+28,iy);
      });};
      draw(col1,0); if(col2.length)draw(col2,colW+40);
    }
    return {w:mW,h:mH};
  });

  dibujarFooter(ctx,W,H,d,fBody);
}

const camposServicios=`
  <div class="campo"><label>Título</label><input type="text" id="c-titulo" value="Nuestros servicios"></div>
  <div class="campo"><label>Servicios (uno por línea)</label>
    <textarea id="c-servicios" style="min-height:140px">Depilación láser\nManicura y pedicura\nFaciales premium\nMasajes relajantes\nLifting de pestañas\nDiseño de cejas</textarea></div>
`;
