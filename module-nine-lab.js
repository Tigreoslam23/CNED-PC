import { parseNumericAnswer } from './core.js';

// Courbe volontairement schématique et symétrique pour isoler les méthodes graphiques.
export function m9PH(volume){if(!Number.isFinite(volume)||volume<0||volume>32)return null;const z=(volume-16)/3;return {ph:7+5*Math.tanh(z),derivative:5/3/Math.cosh(z)**2};}
export function m9Tangents(){const slope=m9PH(13).derivative;return {slope,before:{x:13,y:m9PH(13).ph},after:{x:19,y:m9PH(19).ph},middle:{x:16,y:7}};}
export function m9Ions(volume){
  if(!Number.isFinite(volume)||volume<0||volume>32)return null;
  const initial=1.6,added=.1*volume,totalVolume=20+volume,acid=Math.max(0,initial-added),base=Math.max(0,added-initial),sodium=added,chloride=initial;
  const amounts={acid,base,sodium,chloride},lambda={acid:.035,base:.0199,sodium:.005,chloride:.0076},concentrations={},contributions={};
  for(const key of Object.keys(amounts)){concentrations[key]=amounts[key]/totalVolume*1000;contributions[key]=lambda[key]*concentrations[key];}
  const sigma=Object.values(contributions).reduce((a,b)=>a+b,0),corrected=sigma*totalVolume/20;
  return {volume,totalVolume,acid,base,sodium,chloride,concentrations,contributions,sigma,corrected,stage:Math.abs(volume-16)<1e-9?'at':volume<16?'before':'after'};
}
export function m9Result(cb,va,ve,uve,factor=1){
  if(![cb,va,ve,uve,factor].every(Number.isFinite)||cb<=0||va<=0||ve<=0||uve<=0||uve>=ve||factor<1)return null;
  const ca=cb*ve/va,uca=cb*uve/va,initial=factor*ca,uinitial=factor*uca,relative=uve/ve;
  return [ca,uca,initial,uinitial,relative].every(Number.isFinite)&&ca>0&&uca>0?{ca,uca,initial,uinitial,relative}:null;
}
export function m9Report(value,uncertainty){
  if(![value,uncertainty].every(Number.isFinite)||uncertainty<=0)return null;
  // Deux chiffres significatifs pour u, et même rang pour la valeur centrale.
  let place=Math.floor(Math.log10(uncertainty))-1;
  let rounded=Math.round(uncertainty/10**place)*10**place;
  if(rounded>=10**(place+2)){place++;rounded=Math.round(uncertainty/10**place)*10**place;}
  const exponent=Math.floor(Math.log10(Math.max(Math.abs(value),uncertainty)));
  const sci=place < -8||place>3||exponent>6,scale=sci?10**exponent:1;
  const decimals=Math.max(0,Math.min(14,(sci?exponent:0)-place));
  const formatted=n=>(n/scale).toFixed(decimals).replace('.',',');
  return `(${formatted(value)} ± ${formatted(rounded)})${sci?` × 10<sup>${exponent}</sup>`:''} mol·L⁻¹`;
}
const m9Fmt=(value,digits=3)=>value.toLocaleString('fr-FR',{maximumFractionDigits:digits});
const m9Plot={left:58,right:584,top:32,bottom:274};
const m9X=v=>m9Plot.left+v/32*(m9Plot.right-m9Plot.left);
const m9Y=(v,max)=>m9Plot.bottom-v/max*(m9Plot.bottom-m9Plot.top);
function m9Path(fn,end=32,max=14){const points=[];for(let v=0;v<end;v+=.125)points.push([v,fn(v)]);points.push([end,fn(end)]);return points.map(([v,y],i)=>`${i?'L':'M'}${m9X(v).toFixed(2)},${m9Y(y,max).toFixed(2)}`).join(' ');}
function m9Axes(max,label){return `<g class="m9-grid">${[0,8,16,24,32].map(v=>`<path d="M${m9X(v)} 32 V274"/>`).join('')}${[0,.25,.5,.75,1].map(f=>`<path d="M58 ${m9Y(f*max,max)} H584"/>`).join('')}</g><path d="M58 32 V274 H584" class="m9-axis"/>${[0,8,16,24,32].map(v=>`<text x="${m9X(v)}" y="295" text-anchor="middle" class="m9-axis-text">${v}</text>`).join('')}${[0,.25,.5,.75,1].map(f=>`<text x="48" y="${m9Y(f*max,max)+4}" text-anchor="end" class="m9-axis-text">${m9Fmt(f*max,1)}</text>`).join('')}${label.startsWith('dpH')?'<g class="m9-axis-text"><text x="72" y="10" text-anchor="middle">dpH</text><path d="M58 14 H86" class="m9-axis"/><text x="72" y="28" text-anchor="middle">dV</text><text x="96" y="20">(mL⁻¹)</text></g>':`<text x="58" y="18" class="m9-axis-text">${label}</text>`}<text x="584" y="320" text-anchor="end" class="m9-axis-text">V de titrant ajouté (mL)</text>`;}
function m9Graph(session){
  const cond=session.tool==='conductivity',derivative=!cond&&session.method==='derivative',max=cond?4:derivative?2:14;
  const fn=cond?(v=>m9Ions(v)[session.signal==='measured'?'sigma':'corrected']):(v=>m9PH(v)[derivative?'derivative':'ph']);
  const methodView=!cond&&session.method!=='curve',end=methodView?32:session.volume,reveal=session.revealed||methodView&&(session.method==='derivative'||session.tangentStep===4);
  let overlay='';
  if(!cond&&session.method==='tangents'){
    const t=m9Tangents(),line=(point,css)=>`<path d="M${m9X(0)} ${m9Y(point.y+t.slope*(0-point.x),14)} L${m9X(32)} ${m9Y(point.y+t.slope*(32-point.x),14)}" class="${css}"/>`;
    overlay=line(t.before,'m9-tangent');if(session.tangentStep>=2)overlay+=line(t.after,'m9-tangent');if(session.tangentStep>=3)overlay+=line(t.middle,'m9-midline');
    overlay+=`<circle cx="${m9X(13)}" cy="${m9Y(t.before.y,14)}" r="5" class="m9-dot"/>`;if(session.tangentStep>=2)overlay+=`<circle cx="${m9X(19)}" cy="${m9Y(t.after.y,14)}" r="5" class="m9-dot"/>`;
  }
  if(cond&&session.signal==='corrected'&&session.revealed){const y=m9Ions(16).corrected,before=(y-m9Ions(0).corrected)/16,after=(m9Ions(32).corrected-y)/16;for(const [slope,css] of [[before,'m9-tangent'],[after,'m9-midline']])overlay+=`<path d="M${m9X(0)} ${m9Y(y-16*slope,4)} L${m9X(32)} ${m9Y(y+16*slope,4)}" class="${css}"/>`;}
  const readingY=fn(session.volume),eqY=fn(16);
  return `<svg viewBox="0 0 620 332" class="m9-chart" role="img" aria-label="${cond?'Courbe de conductivité en fonction du volume ajouté':derivative?'Courbe dérivée, maximum à 16 millilitres':session.method==='tangents'?'Construction par tangentes parallèles sur la courbe de pH':'Courbe schématique de pH en fonction du volume ajouté'}"><defs><clipPath id="m9-plot-clip"><rect x="58" y="32" width="526" height="242"/></clipPath></defs>${m9Axes(max,cond?(session.signal==='measured'?'σ mesurée (S·m⁻¹)':'σ corrigée (S·m⁻¹)'):derivative?'dpH/dV (mL⁻¹)':'pH (schématique)')}<g clip-path="url(#m9-plot-clip)">${overlay}<path d="${m9Path(fn,end,max)}" class="m9-curve"/>${reveal?`<path d="M${m9X(16)} ${m9Y(eqY,max)} V274" class="m9-equivalence"/><circle cx="${m9X(16)}" cy="${m9Y(eqY,max)}" r="6" class="m9-eq-dot"/>`:''}${!methodView?`<path d="M${m9X(session.volume)} 32 V274" class="m9-cursor"/><circle cx="${m9X(session.volume)}" cy="${m9Y(readingY,max)}" r="6" class="m9-dot"/>`:''}</g>${reveal?`<text x="${m9X(16)+9}" y="50" class="m9-equivalence-label">Vₑ = 16,0 mL</text>`:''}</svg>`;
}
function m9MiniApparatus(volume){return `<svg viewBox="0 0 150 210" class="m9-mini-apparatus" role="img" aria-label="Le titrant est versé depuis la burette dans le bécher équipé d’une sonde"><path d="M64 12 V105 H86 V12" class="m8-glass"/><rect x="67" y="${20+volume*2.2}" width="16" height="${82-volume*2.2}" class="m8-base-liquid"/><path d="M75 106 V124 M62 113 H88" class="m8-stopcock"/><circle cx="75" cy="137" r="5" class="m9-drop"/><path d="M30 148 V193 Q30 199 36 199 H114 Q120 199 120 193 V148" class="m8-glass"/><path d="M34 172 H116 V194 H34Z" class="m8-solution"/><path d="M106 126 V185" class="m9-probe"/><path d="M56 188 H87" class="m8-stirrer"/><text x="10" y="130" class="m9-axis-text">Sonde</text></svg>`;}
export function moduleNineHero(){return `<div class="hero-figure m9-hero"><div class="figure-label">LIRE LE SIGNAL. RETROUVER L’INCONNUE.</div><svg viewBox="0 0 360 170" aria-hidden="true"><path d="M25 20 V145 H338" class="m9-axis"/><path d="M30 130 C130 130 151 122 164 83 S181 30 330 25" class="m9-curve"/><path d="M174 145 V28" class="m9-equivalence"/><text x="187" y="121" class="m9-equivalence-label">Vₑ</text></svg><div class="m8-hero-path"><span>Mesurer</span><b>→</b><span>Repérer</span><b>→</b><span>Conclure</span></div><p class="figure-note">Un saut, une pente, une précision.<br>Le chapitre prend tout son sens.</p></div>`;}
export function moduleNinePanel(lesson){return `<section class="reaction-lab m9-lab" id="curves-lab" data-m9-lesson="${lesson}" aria-labelledby="m9-title"><div class="rx-heading"><div><span class="eyebrow">MISSIONS 17 ET 18 · COURBES ET PRÉCISION</span><h2 id="m9-title">Le signal raconte le titrage.</h2><p>Construis la courbe, repère l’équivalence, puis présente le résultat.</p></div><span class="badge">Laboratoire interactif</span></div><div class="m3-tools" role="group" aria-label="Ateliers de courbes"><button type="button" data-m9-tool="ph">Suivre le pH</button><button type="button" data-m9-tool="conductivity">Suivre la conductivité</button><button type="button" data-m9-tool="result">Concentration et précision</button></div><div id="m9-workbench"></div></section>`;}
export function mountModuleNine(root,session){
  if(!root)return()=>{};
  const lesson=Number(root.dataset.m9Lesson);if(session.lesson!==lesson){session.lesson=lesson;session.tool=lesson===2?'conductivity':lesson===3?'result':'ph';session.method=lesson===1?'tangents':'curve';if(lesson===1){session.volume=32;session.tangentStep=1;session.revealed=false;}}
  session.volume??=0;session.method??='curve';session.signal??='corrected';session.tangentStep??=1;session.revealed??=false;
  session.cb??='0,100';session.va??='20,0';session.ve??='16,0';session.uve??='0,2';session.factor??='5';
  const bench=root.querySelector('#m9-workbench'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let raf=0,last=0,elapsed=0;
  function stop(){session.playing=false;cancelAnimationFrame(raf);last=0;elapsed=0;root.classList.remove('m9-running');const b=root.querySelector('[data-m9-action="play"]');if(b)b.textContent='Verser et mesurer';}
  function updatePlot(){
    const cond=session.tool==='conductivity',methodView=!cond&&session.method!=='curve';
    root.querySelector('#m9-graph').innerHTML=m9Graph(session);
    root.querySelector('#m9-volume-value').textContent=m9Fmt(session.volume,1)+' mL';root.querySelector('#m9-volume').value=session.volume;
    root.querySelector('#m9-apparatus').innerHTML=m9MiniApparatus(session.volume);
    root.querySelector('[data-m9-action="add"]').disabled=session.volume>=32;root.querySelector('[data-m9-action="finish"]').disabled=session.volume>=32;
    root.querySelectorAll('[data-m9-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m9Method===session.method)));
    const stage=m9Ions(session.volume),ph=m9PH(session.volume);
    root.querySelector('#m9-reading').innerHTML=methodView?`<span>Lecture graphique</span><strong>${session.method==='derivative'||session.tangentStep===4?'Vₑ = 16 mL':'Construction'}</strong><span>Après les mesures</span>`:`<span>${cond?(session.signal==='corrected'?'Signal corrigé':'Conductivité mesurée'):'pH schématique'}</span><strong>${m9Fmt(cond?(session.signal==='corrected'?stage.corrected:stage.sigma):ph.ph,2)}${cond?' S·m⁻¹':''}</strong>`;
    root.querySelector('#m9-volume-controls').hidden=methodView;
    root.querySelector('#m9-method-story').innerHTML=cond?`<strong>${{before:'Avant l’équivalence',at:'À l’équivalence',after:'Après l’équivalence'}[stage.stage]}</strong><p>${{before:'H₃O⁺ très conducteur est consommé ; Na⁺ est apporté par la soude. Le signal diminue.',at:'Les réactifs sont en proportions 1:1. Na⁺ et Cl⁻ restent : la conductivité n’est pas nulle.',after:'HO⁻ n’est plus entièrement consommé. Il s’accumule avec Na⁺ : le signal augmente.'}[stage.stage]}</p>`:session.method==='tangents'?`<strong>Construction · étape ${session.tangentStep} sur 4</strong><p>${['Une première tangente touche la courbe avant le saut.','La seconde tangente, de même pente, touche la courbe après le saut. Les deux droites sont parallèles.','La troisième droite est parallèle aux deux autres et située exactement à mi-distance.','L’intersection de la parallèle médiane avec la courbe repère le point E. Sa projection sur l’axe des volumes donne Vₑ = 16,0 mL.'][session.tangentStep-1]}</p><button type="button" class="button secondary" data-m9-action="tangent">${session.tangentStep===4?'Recommencer la construction':'Étape suivante de la construction'}</button>`:session.method==='derivative'?'<strong>Le maximum repère le saut.</strong><p>La dérivée mesure la variation du pH par unité de volume. Son maximum se situe ici à 16,0 mL : c’est l’abscisse qui donne Vₑ, pas la hauteur du pic.</p>':`<strong>${session.volume===0?'Prêt pour les mesures.':session.volume<16?'Le pH augmente.':session.volume===16?'Au centre du saut.':'Le saut a été franchi.'}</strong><p>Verse progressivement et observe le point se déplacer. Pour repérer Vₑ, termine les mesures puis compare les méthodes « Tangentes » et « Dérivée ».</p>`;
    root.querySelector('#m9-reveal-note').textContent=session.revealed?'Lecture du graphique : Vₑ = 16,0 mL. Ce volume est celui du titrant ajouté.':'';
    if(cond){
      const colors={acid:'m9-h',sodium:'m9-na',chloride:'m9-cl',base:'m9-oh'},names={acid:'H₃O⁺',sodium:'Na⁺',chloride:'Cl⁻',base:'HO⁻'};
      root.querySelector('#m9-ion-detail').innerHTML=Object.keys(names).map(key=>`<div class="m9-ion-row"><span class="m9-ion-symbol ${colors[key]}">${names[key]}</span><span>${m9Fmt(stage[key],2)} mmol</span><div class="m9-ion-bar"><i class="${colors[key]}" style="width:${Math.min(100,stage.contributions[key]/3*100)}%"></i></div><span>${m9Fmt(stage.contributions[key],3)} S·m⁻¹</span></div>`).join('');
    }
  }
  function plot(){
    const cond=session.tool==='conductivity';
    bench.innerHTML=`<div class="m8-experiment-data"><span>HCl titré par la soude · réaction 1:1</span><span>V<sub>A</sub> = 20,0 mL</span><span>C<sub>B</sub> = 0,100 mol·L⁻¹</span></div>${cond?`<label class="m9-signal-label" for="m9-signal">Signal représenté<select id="m9-signal"><option value="corrected">Corrigé de la dilution · deux droites</option><option value="measured">Mesuré · le volume du bécher augmente</option></select></label>`:`<div class="m8-label-modes" role="group" aria-label="Méthodes de repérage"><button type="button" data-m9-method="curve">Courbe de pH</button><button type="button" data-m9-method="tangents">Tangentes parallèles</button><button type="button" data-m9-method="derivative">Courbe dérivée</button></div>`}<div class="m9-experiment"><div class="m9-graph-card"><div id="m9-graph"></div><p id="m9-reveal-note" class="m9-reveal-note" role="status"></p></div><aside class="m9-measure-card"><div id="m9-apparatus"></div><div id="m9-reading" class="m9-reading"></div></aside></div><div id="m9-volume-controls"><label class="m8-volume-label" for="m9-volume">Volume de titrant ajouté <output id="m9-volume-value"></output><input id="m9-volume" type="range" min="0" max="32" step="0.2" value="${session.volume}"></label><div class="m8-titration-actions"><button type="button" class="button" data-m9-action="play" ${reduced?'disabled':''}>Verser et mesurer</button><button type="button" class="button secondary" data-m9-action="add">Ajouter 0,2 mL</button><button type="button" class="text-button" data-m9-action="finish">Terminer les mesures</button><button type="button" class="text-button" data-m9-action="reset">Recommencer</button><button type="button" class="text-button" data-m9-action="reveal">Repérer l’équivalence</button></div></div><div id="m9-method-story" class="m3-explanation" role="status"></div>${cond?'<div class="m9-ion-detail"><h3>Quels ions conduisent le courant ?</h3><p class="m3-legend">Quantités présentes et contributions à la conductivité <strong>mesurée</strong>, avec dilution.</p><div id="m9-ion-detail"></div><p class="m3-legend">σ est la somme des contributions. Conductivités molaires ioniques fixées : H₃O⁺ 35,0 ; Na⁺ 5,0 ; Cl⁻ 7,6 ; HO⁻ 19,9 mS·m²·mol⁻¹.</p></div>':''}<p class="m3-legend">${cond?'Modèle de solutions diluées à température fixée ; bilan stœchiométrique, autoprotolyse négligée. La dilution est incluse dans σ mesurée. Pour obtenir deux droites, σ corrigée = σ × (Vₐ + V)/Vₐ. La courbe en V est celle du cas HCl/soude.':'La courbe de pH est schématique, symétrique et élargie pour voir les méthodes. Elle ne calcule pas les équilibres chimiques et ne prédit pas le pH réel. Elle illustre un titrage acide fort/base forte à 25 °C ; pHₑ = 7 ne se généralise pas.'} Les couleurs et la goutte sont symboliques.${reduced?' Mouvement réduit activé : utilise le curseur ou les ajouts manuels.':''}</p>`;
    if(cond)root.querySelector('#m9-signal').value=session.signal;updatePlot();
  }
  function resultUpdate(){
    const m=m9Result(...['cb','va','ve','uve','factor'].map(key=>parseNumericAnswer(session[key]))),target=root.querySelector('#m9-result');
    if(!m){target.innerHTML='<p class="m4-error">Vérifie les valeurs : concentration et volumes strictement positifs, 0 &lt; u(Vₑ) &lt; Vₑ et facteur de dilution F ≥ 1. Ne recopie pas les unités.</p>';return;}
    const cb=parseNumericAnswer(session.cb),va=parseNumericAnswer(session.va),ve=parseNumericAnswer(session.ve),uve=parseNumericAnswer(session.uve),factor=parseNumericAnswer(session.factor);
    const num=v=>v!==0&&(Math.abs(v)<.00001||Math.abs(v)>=1e7)?v.toExponential(3).replace('.',','):m9Fmt(v,8);
    target.innerHTML=`<ol class="m4-calculation-steps"><li><span>1</span><div><strong>Utiliser l’équivalence 1:1</strong><p>C<sub>A</sub> = C<sub>B</sub> × V<sub>E</sub>/V<sub>A</sub> = ${num(cb)} × ${num(ve)} / ${num(va)} = ${num(m.ca)} mol·L⁻¹.</p></div></li><li><span>2</span><div><strong>Propager l’incertitude de lecture</strong><p>u(C<sub>A</sub>) = C<sub>A</sub> × u(V<sub>E</sub>)/V<sub>E</sub> = ${num(m.ca)} × ${num(uve)} / ${num(ve)} = ${num(m.uca)} mol·L⁻¹.</p><p>Incertitude relative : ${m9Fmt(100*m.relative,2)} %.</p></div></li><li><span>3</span><div><strong>Retrouver la solution avant dilution</strong><p>C<sub>initiale</sub> = F × C<sub>A</sub> = ${num(factor)} × ${num(m.ca)} = ${num(m.initial)} mol·L⁻¹.</p><p>u(C<sub>initiale</sub>) = F × u(C<sub>A</sub>) = ${num(m.uinitial)} mol·L⁻¹.</p></div></li></ol><div class="m9-final-result"><span class="eyebrow">SOLUTION TITRÉE</span><p>${m9Report(m.ca,m.uca)}</p><span class="eyebrow">SOLUTION AVANT DILUTION · F = ${num(factor)}</span><p>${m9Report(m.initial,m.uinitial)}</p></div><p class="m3-legend">Présentation avec deux chiffres significatifs pour u, et même rang décimal pour C. u est une incertitude-type. Les incertitudes de C<sub>B</sub>, V<sub>A</sub> et F sont négligées ; sinon, il faut aussi les propager.</p>`;
  }
  function result(){bench.innerHTML=`<form id="m9-result-form" class="m8-form m8-calculation-form">${[['cb','Concentration du titrant C<sub>B</sub> (mol·L⁻¹)'],['va','Volume prélevé V<sub>A</sub> (mL)'],['ve','Volume équivalent V<sub>E</sub> (mL)'],['uve','Incertitude-type u(V<sub>E</sub>) (mL)'],['factor','Facteur de dilution F (sans unité)']].map(([key,label])=>`<label for="m9-${key}">${label}<input id="m9-${key}" type="text" autocomplete="off"></label>`).join('')}<button type="submit" class="button">Calculer et présenter le résultat</button></form><p class="m3-legend">Réaction 1:1. Les deux volumes sont en mL. Choisis F = 1 s’il n’y a pas eu de dilution. Virgule, point et écriture scientifique acceptés.</p><div id="m9-result" role="status"></div>`;for(const key of ['cb','va','ve','uve','factor'])root.querySelector('#m9-'+key).value=session[key];resultUpdate();}
  function render(){stop();root.querySelectorAll('[data-m9-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m9Tool===session.tool)));session.tool==='result'?result():plot();}
  function tick(time){if(!session.playing)return;if(last)elapsed+=time-last;last=time;if(elapsed>=260){elapsed%=260;session.volume=Math.min(32,Math.round((session.volume+.4)*10)/10);updatePlot();if(session.volume>=32){stop();return;}}raf=requestAnimationFrame(tick);}
  function click(event){const b=event.target.closest('button');if(!b)return;const d=b.dataset;if(d.m9Tool){session.tool=d.m9Tool;render();return;}if(d.m9Method){stop();session.method=d.m9Method;session.tangentStep=1;session.revealed=false;if(session.method!=='curve')session.volume=32;updatePlot();return;}const action=d.m9Action;if(!action)return;
    if(action==='play'&&!reduced){if(session.playing)stop();else{if(session.volume>=32){session.volume=0;session.revealed=false;}session.playing=true;root.classList.add('m9-running');b.textContent='Mettre en pause';raf=requestAnimationFrame(tick);}return;}
    stop();if(action==='tangent')session.tangentStep=session.tangentStep%4+1;
    if(action==='add')session.volume=Math.min(32,Math.round((session.volume+.2)*10)/10);
    if(action==='finish')session.volume=32;
    if(action==='reset'){session.volume=0;session.revealed=false;}
    if(action==='reveal'){session.volume=32;session.revealed=true;}
    updatePlot();
  }
  function input(event){const el=event.target;if(el.id==='m9-volume'){stop();session.volume=Number(el.value);updatePlot();}else for(const key of ['cb','va','ve','uve','factor'])if(el.id==='m9-'+key)session[key]=el.value;}
  function change(event){if(event.target.id==='m9-signal'){stop();session.signal=event.target.value;updatePlot();}}
  function submit(event){if(event.target.id==='m9-result-form'){event.preventDefault();resultUpdate();}}
  root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('change',change);root.addEventListener('submit',submit);render();
  return()=>{stop();root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('change',change);root.removeEventListener('submit',submit);};
}
