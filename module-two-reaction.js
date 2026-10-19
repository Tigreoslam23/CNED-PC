export const vinegarSpecies = {
  acid:{C:2,H:4,O:2,charge:0}, bicarbonate:{C:1,H:1,O:3,charge:-1}, acetate:{C:2,H:3,O:2,charge:-1},
  proton:{C:0,H:1,O:0,charge:1}, carbonic:{C:1,H:2,O:3,charge:0}, water:{C:0,H:2,O:1,charge:0}, gas:{C:1,H:0,O:2,charge:0}
};
export function vinegarInventory(names) {
  return names.reduce((total,name)=>{for(const key of ['C','H','O','charge']) total[key]+=vinegarSpecies[name][key];return total;},{C:0,H:0,O:0,charge:0});
}
export function vinegarFrame(value) {
  const p=Math.max(0,Math.min(1,Number(value)||0));
  const transfer=Math.max(0,Math.min(1,(p-.12)/.48));
  const t=transfer*transfer*(3-2*transfer);
  const d=Math.max(0,Math.min(1,(p-.72)/.24));
  const mix=(a,b)=>a+(b-a)*d;
  const donorCharge=p<.18?0:-1, acceptorCharge=p<.59?-1:0, protonCharge=-1-donorCharge-acceptorCharge;
  const stage=p<.18?0:p<.60?1:p<.85?2:3;
  return {progress:p,stage,decompose:d,donorCharge,acceptorCharge,protonCharge,
    proton:[295+55*t,mix(200-52*Math.sin(Math.PI*t),285)],
    carbon:[mix(470,520),mix(200,135)],doubleO:[mix(470,440),mix(110,135)],rightO:[mix(540,600),mix(200,135)],waterO:[400,mix(200,280)],otherH:[mix(585,440),mix(245,315)],
    donorBond:Math.max(0,1-p/.18),newBond:Math.max(0,Math.min(1,(p-.51)/.09)),
    inventory:vinegarInventory(p<.18?['acid','bicarbonate']:p<.59?['acetate','bicarbonate','proton']:p<.85?['acetate','carbonic']:['acetate','water','gas'])};
}
export function amphotericModel(role) {
  return role==='acid' ? {role:'Acide',action:'HCO₃⁻ cède H⁺ à HO⁻.',equation:'HCO₃⁻ + HO⁻ → CO₃²⁻ + H₂O',couple:'HCO₃⁻ / CO₃²⁻',product:'CO₃²⁻',charge:-2}
    : {role:'Base',action:'HCO₃⁻ capte H⁺ venant de CH₃COOH.',equation:'CH₃COOH + HCO₃⁻ → CH₃COO⁻ + H₂CO₃',couple:'H₂CO₃ / HCO₃⁻',product:'H₂CO₃',charge:0};
}
export function moduleTwoHero() {
  return `<div class="hero-figure m2-hero"><div class="figure-label">MISSION 3 · DE L’OBSERVATION AU MODÈLE</div><div class="m2-bubbles" aria-hidden="true"><span></span><span></span><span></span></div><div class="m2-hero-formula">Vinaigre + bicarbonate</div><div class="m2-hero-arrow" aria-hidden="true">↓</div><div class="m2-hero-formula">Des bulles de <strong>CO₂</strong></div><p class="figure-note">Un transfert de H⁺, puis la formation d’un gaz.</p></div>`;
}
export function moduleTwoReactionPanel(lesson=0) {
  const atom=(key,label,cls,x,y,r=25)=>`<g data-v="${key}" transform="translate(${x} ${y})" class="rx-atom ${cls}"><circle r="${r}"/><text x="0" y="2">${label}</text></g>`;
  return `<section class="reaction-lab m2-lab" id="module-two-lab" aria-labelledby="v-title"><div class="rx-heading"><div><span class="eyebrow">MODULE 2 · MISSIONS 3 ET 4</span><h2 id="v-title">Du transfert aux bulles.</h2><p>Le H en jaune passe de l’acide au bicarbonate. Observe ensuite ce que devient l’intermédiaire.</p></div><span class="rx-model-badge">Modèles simplifiés en 2D</span></div>
    <div class="m2-equation-label">Bilan global</div><div class="rx-equation m2-global"><span>CH₃COOH + HCO₃⁻</span><b>→</b><span>CH₃COO⁻ + H₂O + CO₂</span></div>
    <div class="rx-layout"><div class="rx-models"><div class="rx-partners"><div><strong data-v="left-formula">CH₃COOH</strong><span data-v="left-name">Acide éthanoïque · donneur de H⁺</span></div><div><strong data-v="right-formula">HCO₃⁻</strong><span data-v="right-name">Hydrogénocarbonate · receveur de H⁺</span></div></div>
    <svg class="rx-scene v-scene" viewBox="0 0 650 355" role="img" aria-labelledby="v-svg-title v-svg-desc"><title id="v-svg-title">Réaction de l’acide éthanoïque et de l’hydrogénocarbonate</title><desc id="v-svg-desc">Le groupe CH₃ représente un carbone et trois hydrogènes. Un H est transféré de l’acide vers HCO₃ moins, formant H₂CO₃. Ce dernier donne H₂O et CO₂. Les charges concernent les ions entiers.</desc>
      <defs><radialGradient id="v-o" cx="32%" cy="25%"><stop class="rx-o-light"/><stop offset="100%" class="rx-o-dark"/></radialGradient><radialGradient id="v-h" cx="32%" cy="25%"><stop class="rx-h-light"/><stop offset="100%" class="rx-h-dark"/></radialGradient><radialGradient id="v-p" cx="32%" cy="25%"><stop class="rx-p-light"/><stop offset="100%" class="rx-p-dark"/></radialGradient></defs>
      <g class="rx-bonds"><line x1="75" y1="200" x2="160" y2="200"/><line x1="156" y1="200" x2="156" y2="110"/><line x1="164" y1="200" x2="164" y2="110"/><line x1="160" y1="200" x2="235" y2="200"/><line data-v="old-h-bond" class="rx-transferred-bond" x1="235" y1="200" x2="295" y2="200"/>
      <line data-v="c-water" x1="470" y1="200" x2="400" y2="200"/><line data-v="c-o1"/><line data-v="c-o2"/><line data-v="c-right1"/><line data-v="c-right2" opacity="0"/><line data-v="old-right-h" x1="540" y1="200" x2="585" y2="245"/><line data-v="new-h-bond" class="rx-transferred-bond" x1="400" y1="200" x2="350" y2="200" opacity="0"/><line data-v="water-other-h" opacity="0"/></g>
      ${atom('group','CH₃','v-carbon v-methyl',75,200,35)}${atom('left-c','C','v-carbon',160,200,29)}${atom('left-o1','O','rx-oxygen',160,110,27)}${atom('left-o2','O','rx-oxygen',235,200,27)}
      ${atom('carbon','C','v-carbon',470,200,29)}${atom('double-o','O','rx-oxygen',470,110,27)}${atom('right-o','O','rx-oxygen',540,200,27)}${atom('water-o','O','rx-oxygen',400,200,27)}${atom('other-h','H','rx-hydrogen',585,245,22)}
      <g data-v="left-ion" class="rx-ion" opacity="0"><path d="M40 65H24V255H40 M305 65H321V255H305"/><text x="330" y="60">−</text></g><g data-v="right-ion" class="rx-ion"><path d="M370 65H354V280H370 M620 65H636V280H620"/><text x="638" y="55">−</text></g>
      <g data-v="proton" transform="translate(295 200)" class="rx-atom rx-proton"><circle class="rx-proton-ring" r="29"/><circle r="22"/><text data-v="proton-label" x="0" y="2">H</text></g>
      <g data-v="gas-bubbles" class="v-gas" opacity="0"><circle cx="600" cy="70" r="12"/><circle cx="615" cy="40" r="8"/><circle cx="596" cy="18" r="5"/><text x="535" y="50">CO₂ gazeux</text></g>
    </svg><div class="rx-legend"><span><i class="v-carbon-key"></i>Carbone C</span><span><i class="rx-key-oxygen"></i>Oxygène O</span><span><i class="rx-key-hydrogen"></i>Hydrogène H</span><span><i class="rx-key-proton"></i>H transféré</span></div><p class="v-group-note">La boule CH₃ regroupe un C et trois H ; elle reste inchangée.</p></div>
    <div class="rx-story"><span class="eyebrow" data-v="counter">ÉTAPE 1 / 4</span><h3 data-v="title">Identifier les partenaires</h3><p data-v="text"></p><div class="rx-charge-status"><strong>Charge totale conservée : −1</strong><span>3 C · 5 H · 5 O, avant comme après.</span></div><p data-v="live" class="sr-only" role="status" aria-live="polite"></p></div></div>
    <div class="rx-controls"><button class="button" type="button" data-v-action="play">Lire l’animation</button><div class="rx-step-controls"><button class="button secondary" type="button" data-v-action="previous" disabled>← Étape précédente</button><button class="button secondary" type="button" data-v-action="next">Étape suivante →</button><button class="text-button" type="button" data-v-action="reset">Revenir au début</button></div></div>
    <div class="rx-step-list" aria-label="Étapes du mélange vinaigre–bicarbonate">${['Les partenaires','Transférer H⁺','L’intermédiaire','Former les bulles'].map((s,i)=>`<button type="button" data-v-stage="${i}" ${i===0?'aria-current="step"':''}><span>${i+1}</span>${s}</button>`).join('')}</div>
    <details class="rx-couples" ${lesson===1?'open':''}><summary>Assembler les deux demi-équations</summary><div class="v-half-equations"><p>CH₃COOH = CH₃COO⁻ + <mark data-v-cancel>H⁺</mark></p><p>HCO₃⁻ + <mark data-v-cancel>H⁺</mark> = H₂CO₃</p></div><button type="button" class="button secondary" data-v-action="assemble">Assembler et simplifier H⁺</button><div data-v="assembled" class="v-assembled" role="status" hidden><strong>CH₃COOH + HCO₃⁻ → CH₃COO⁻ + H₂CO₃</strong><p>H⁺ est fourni et capté en même quantité : il se simplifie. Puis H₂CO₃ donne H₂O + CO₂.</p></div></details>
    <details class="rx-couples" ${lesson===3?'open':''}><summary>HCO₃⁻ : changer de partenaire, changer de rôle</summary><div class="v-partner-picker" role="group" aria-label="Partenaire de HCO₃⁻"><button type="button" class="button secondary" data-v-partner="base" aria-pressed="true">Face à CH₃COOH, un acide</button><button type="button" class="button secondary" data-v-partner="acid" aria-pressed="false">Face à HO⁻, une base</button></div><div class="v-ampho-result" role="status" aria-live="polite"><span class="eyebrow">RÔLE DE HCO₃⁻ : <strong data-v="ampho-role">BASE</strong></span><p data-v="ampho-action"></p><div class="v-ampho-equation formula" data-v="ampho-equation"></div><p>Couple utilisé : <strong data-v="ampho-couple"></strong></p></div></details>
    <p class="rx-caveat">Les boules et les trajectoires sont schématiques. Le H⁺ est isolé dans le dessin pour suivre son transfert, pas pour représenter une espèce durablement isolée dans l’eau. Les bulles représentent le dégagement de CO₂, pas des atomes supplémentaires. Les ions sodium du bicarbonate ne sont pas représentés : ils sont spectateurs.</p></section>`;
}
export function mountModuleTwoReaction(root,session={progress:0,ampho:'base',assembled:false}) {
  if(!root)return()=>{};
  const get=k=>root.querySelector(`[data-v="${k}"]`);
  const stages=[
    ['Identifier les partenaires','L’acide CH₃COOH peut donner H⁺. HCO₃⁻ peut le recevoir : il joue ici le rôle de base. Repère le H jaune lié à l’oxygène de l’acide.'],
    ['Transférer H⁺','CH₃COOH cède H⁺ et devient CH₃COO⁻. Le H repéré se dirige vers un oxygène de HCO₃⁻. Le groupe CH₃ reste inchangé.'],
    ['Former l’intermédiaire','HCO₃⁻ a reçu H⁺ : il devient H₂CO₃, l’acide carbonique. Le bilan intermédiaire est CH₃COO⁻ + H₂CO₃.'],
    ['Expliquer les bulles','H₂CO₃ se transforme en H₂O et CO₂. Les bulles sont du dioxyde de carbone. Le H jaune se retrouve dans l’eau, et l’ion éthanoate CH₃COO⁻ reste présent.']
  ];
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing=false,raf=null,last=null,announced=-1,disposed=false;
  const move=(k,point)=>get(k).setAttribute('transform',`translate(${point[0]} ${point[1]})`);
  const line=(k,a,b,opacity=1)=>{const el=get(k);el.setAttribute('x1',a[0]);el.setAttribute('y1',a[1]);el.setAttribute('x2',b[0]);el.setAttribute('y2',b[1]);el.setAttribute('opacity',opacity);};
  const double=(prefix,a,b,spread=4,secondOpacity=1)=>{const length=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const dx=-(b[1]-a[1])/length*spread,dy=(b[0]-a[0])/length*spread;line(prefix+'1',[a[0]+dx,a[1]+dy],[b[0]+dx,b[1]+dy]);line(prefix+'2',[a[0]-dx,a[1]-dy],[b[0]-dx,b[1]-dy],secondOpacity);};
  function extras(){
    const a=amphotericModel(session.ampho);
    get('ampho-role').textContent=a.role.toUpperCase();get('ampho-action').textContent=a.action;get('ampho-equation').textContent=a.equation;get('ampho-couple').textContent=a.couple;
    root.querySelectorAll('[data-v-partner]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vPartner===session.ampho)));
    get('assembled').hidden=!session.assembled;root.querySelectorAll('[data-v-cancel]').forEach(el=>el.classList.toggle('v-cancelled',session.assembled));
    root.querySelector('[data-v-action="assemble"]').textContent=session.assembled?'Revoir les demi-équations':'Assembler et simplifier H⁺';
  }
  function paint(){
    const f=vinegarFrame(session.progress);session.progress=f.progress;
    for(const [k,point] of Object.entries({'proton':f.proton,'carbon':f.carbon,'double-o':f.doubleO,'right-o':f.rightO,'water-o':f.waterO,'other-h':f.otherH}))move(k,point);
    double('c-o',f.carbon,f.doubleO);double('c-right',f.carbon,f.rightO,4*f.decompose,f.decompose);
    line('c-water',f.carbon,f.waterO,1-f.decompose);line('old-right-h',f.rightO,f.otherH,1-f.decompose);line('water-other-h',f.waterO,f.otherH,f.decompose);line('new-h-bond',f.waterO,f.proton,f.newBond);
    get('old-h-bond').setAttribute('opacity',f.donorBond);get('left-ion').setAttribute('opacity',f.donorCharge?-1*f.donorCharge:0);get('right-ion').setAttribute('opacity',f.acceptorCharge?-1*f.acceptorCharge:0);
    get('proton-label').textContent=f.protonCharge?'H⁺':'H';get('gas-bubbles').setAttribute('opacity',f.decompose);
    get('left-formula').textContent=f.donorCharge?'CH₃COO⁻':'CH₃COOH';get('left-name').textContent=f.donorCharge?'Ion éthanoate · base conjuguée':'Acide éthanoïque · donneur de H⁺';
    get('right-formula').textContent=f.decompose>.5?'CO₂ + H₂O':f.acceptorCharge?'HCO₃⁻':'H₂CO₃';get('right-name').textContent=f.decompose>.5?'Dioxyde de carbone et eau':f.acceptorCharge?'Hydrogénocarbonate · receveur de H⁺':'Acide carbonique · intermédiaire';
    get('counter').textContent=`ÉTAPE ${f.stage+1} / 4`;get('title').textContent=stages[f.stage][0];get('text').textContent=stages[f.stage][1];
    if(f.stage!==announced){get('live').textContent=stages[f.stage].join('. ');announced=f.stage;}
    root.querySelectorAll('[data-v-stage]').forEach(b=>{if(Number(b.dataset.vStage)===f.stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    const play=root.querySelector('[data-v-action="play"]');play.disabled=motion.matches;play.textContent=motion.matches?'Mode sans mouvement':playing?'Mettre en pause':f.progress>=1?'Rejouer l’animation':f.progress>0?'Reprendre l’animation':'Lire l’animation';
    root.querySelector('[data-v-action="previous"]').disabled=f.progress<=0;root.querySelector('[data-v-action="next"]').disabled=f.progress>=1;
  }
  function stop(){playing=false;last=null;if(raf!==null)cancelAnimationFrame(raf);raf=null;}
  function tick(time){if(disposed||!playing)return;if(last!==null)session.progress=Math.min(1,session.progress+Math.min(time-last,80)/15000);last=time;if(session.progress>=1)stop();paint();if(playing)raf=requestAnimationFrame(tick);}
  function go(p){stop();session.progress=p;paint();}
  const positions=[0,1/3,2/3,1];
  function click(event){
    const stage=event.target.closest('[data-v-stage]');if(stage){go(positions[Number(stage.dataset.vStage)]);return;}
    const partner=event.target.closest('[data-v-partner]');if(partner){session.ampho=partner.dataset.vPartner;extras();return;}
    const action=event.target.closest('[data-v-action]')?.dataset.vAction;
    if(action==='assemble'){session.assembled=!session.assembled;extras();}
    if(action==='play'&&!motion.matches){if(playing)stop();else{if(session.progress>=1)session.progress=0;playing=true;raf=requestAnimationFrame(tick);}paint();}
    if(action==='next')go(positions.find(p=>p>session.progress+.001)??1);
    if(action==='previous')go([...positions].reverse().find(p=>p<session.progress-.001)??0);
    if(action==='reset')go(0);
  }
  function changed(){if(motion.matches)stop();paint();}
  function hidden(){if(document.hidden){stop();paint();}}
  root.addEventListener('click',click);motion.addEventListener('change',changed);document.addEventListener('visibilitychange',hidden);paint();extras();
  return()=>{disposed=true;stop();root.removeEventListener('click',click);motion.removeEventListener('change',changed);document.removeEventListener('visibilitychange',hidden);};
}
