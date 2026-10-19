export const reactionStages = [
  { title: 'Deux partenaires au départ', text: 'H₃O⁺ est l’acide : il peut céder H⁺. NH₃ est la base : elle peut capter H⁺. Le H repéré en jaune est celui qui sera transféré.' },
  { title: 'L’acide cède H⁺', text: 'L’ion oxonium perd H⁺ et devient une molécule d’eau H₂O. La liaison avec le H repéré se rompt ; aucun atome O ou N ne change de partenaire.' },
  { title: 'La base capte H⁺', text: 'Le H⁺ se rapproche de l’ammoniac. Il sera lié à l’azote N : NH₃ capte H⁺ pour devenir NH₄⁺. Un proton est transféré, pas une molécule entière.' },
  { title: 'Deux nouvelles espèces', text: 'H₃O⁺ est devenu H₂O ; NH₃ est devenu NH₄⁺. Le même H est maintenant lié à N. Les 6 hydrogènes et la charge totale +1 sont conservés.' }
];

// One transferred proton plus five hydrogens that remain on their original partners.
export function reactionFrame(value) {
  const p = Math.max(0, Math.min(1, Number(value) || 0));
  const moved = Math.max(0, Math.min(1, (p - 0.13) / 0.74));
  const ease = moved * moved * (3 - 2 * moved);
  const donorCharge = p < 0.18 ? 1 : 0;
  const acceptorCharge = p >= 0.86 ? 1 : 0;
  const protonCharge = 1 - donorCharge - acceptorCharge;
  return { progress: p, x: 185 + 275 * ease, y: 100 - 42 * Math.sin(Math.PI * ease),
    donorCharge, acceptorCharge, protonCharge,
    donorBond: Math.max(0, 1 - p / 0.18), acceptorBond: Math.max(0, Math.min(1, (p - 0.80) / 0.14)),
    donorFormula: donorCharge ? 'H₃O⁺' : 'H₂O', acceptorFormula: acceptorCharge ? 'NH₄⁺' : 'NH₃',
    stage: p < 0.18 ? 0 : p < 0.5 ? 1 : p < 0.86 ? 2 : 3,
    atoms: { H: 6, O: 1, N: 1 }, totalCharge: donorCharge + acceptorCharge + protonCharge };
}

export function reactionPanel() {
  return `<section class="reaction-lab" id="reaction-lab" aria-labelledby="rx-title">
    <div class="rx-heading"><div><span class="eyebrow">OBSERVER POUR COMPRENDRE · MISSIONS 1 À 3</span><h2 id="rx-title">Un H⁺ change de partenaire.</h2><p>Observe les modèles, puis avance à ton rythme. Le H en jaune restera le même du début à la fin.</p></div><span class="rx-model-badge">Modèles simplifiés en 2D</span></div>
    <div class="rx-equation" aria-label="Ion oxonium plus ammoniac donne eau plus ion ammonium"><span class="rx-family-one">H₃O⁺</span><b>+</b><span class="rx-family-two">NH₃</span><b>→</b><span class="rx-family-one">H₂O</span><b>+</b><span class="rx-family-two">NH₄⁺</span></div>
    <div class="rx-layout"><div class="rx-models">
      <div class="rx-partners"><div><strong data-rx="donor-formula">H₃O⁺</strong><span data-rx="donor-name">Ion oxonium · acide</span></div><div><strong data-rx="acceptor-formula">NH₃</strong><span data-rx="acceptor-name">Ammoniac · base</span></div></div>
      <svg class="rx-scene" viewBox="0 0 640 310" role="img" aria-labelledby="rx-svg-title rx-svg-description">
        <title id="rx-svg-title">Transfert d’un H⁺ de H₃O⁺ vers NH₃</title><desc id="rx-svg-description">Au départ, O est lié à trois H et N à trois H. Un H passe de O à N. À l’arrivée, O est lié à deux H et N à quatre H. Les crochets et le signe plus indiquent l’ion entier.</desc>
        <defs><radialGradient id="rx-oxygen-shade" cx="32%" cy="25%"><stop class="rx-o-light"/><stop offset="100%" class="rx-o-dark"/></radialGradient><radialGradient id="rx-nitrogen-shade" cx="32%" cy="25%"><stop class="rx-n-light"/><stop offset="100%" class="rx-n-dark"/></radialGradient><radialGradient id="rx-hydrogen-shade" cx="32%" cy="25%"><stop class="rx-h-light"/><stop offset="100%" class="rx-h-dark"/></radialGradient><radialGradient id="rx-proton-shade" cx="32%" cy="25%"><stop class="rx-p-light"/><stop offset="100%" class="rx-p-dark"/></radialGradient></defs>
        <ellipse class="rx-shadow" cx="155" cy="278" rx="103" ry="12"/><ellipse class="rx-shadow" cx="485" cy="278" rx="103" ry="12"/>
        <g class="rx-bonds"><line x1="155" y1="180" x2="85" y2="205"/><line x1="155" y1="180" x2="195" y2="245"/><line x1="485" y1="180" x2="415" y2="215"/><line x1="485" y1="180" x2="525" y2="245"/><line x1="485" y1="180" x2="550" y2="155"/>
          <line data-rx="donor-bond" class="rx-transferred-bond" x1="155" y1="180" x2="185" y2="100"/><line data-rx="acceptor-bond" class="rx-transferred-bond" x1="485" y1="180" x2="460" y2="100" opacity="0"/>
        </g>
        <g class="rx-atom rx-oxygen"><circle cx="155" cy="180" r="34"/><text x="155" y="182">O</text></g>
        <g class="rx-atom rx-nitrogen"><circle cx="485" cy="180" r="34"/><text x="485" y="182">N</text></g>
        <g class="rx-atom rx-hydrogen"><circle cx="85" cy="205" r="24"/><text x="85" y="207">H</text><circle cx="195" cy="245" r="24"/><text x="195" y="247">H</text><circle cx="415" cy="215" r="24"/><text x="415" y="217">H</text><circle cx="525" cy="245" r="24"/><text x="525" y="247">H</text><circle cx="550" cy="155" r="24"/><text x="550" y="157">H</text></g>
        <g data-rx="donor-ion" class="rx-ion"><path d="M65 65H49V274H65 M230 65H246V274H230"/><text x="263" y="67">+</text></g>
        <g data-rx="acceptor-ion" class="rx-ion" opacity="0"><path d="M389 65H373V274H389 M580 65H596V274H580"/><text x="613" y="67">+</text></g>
        <g data-rx="proton" transform="translate(185 100)" class="rx-atom rx-proton"><circle class="rx-proton-ring" r="31"/><circle r="24"/><text data-rx="proton-label" x="0" y="2">H</text><text class="rx-follow-label" x="0" y="-44">H repéré</text></g>
      </svg>
      <div class="rx-legend" aria-label="Légende des modèles"><span><i class="rx-key-oxygen"></i>Oxygène O</span><span><i class="rx-key-nitrogen"></i>Azote N</span><span><i class="rx-key-hydrogen"></i>Hydrogène H</span><span><i class="rx-key-proton"></i>H transféré</span></div>
    </div><div class="rx-story"><span class="eyebrow" data-rx="counter">ÉTAPE 1 / 4</span><h3 data-rx="stage-title">Deux partenaires au départ</h3><p data-rx="stage-text">${reactionStages[0].text}</p><div class="rx-charge-status"><strong>Charge totale conservée : +1</strong><span>6 H · 1 O · 1 N, avant comme après.</span></div><p class="rx-live sr-only" data-rx="live" role="status" aria-live="polite"></p></div></div>
    <div class="rx-controls"><button type="button" class="button" data-rx-action="play">Lire l’animation</button><div class="rx-step-controls"><button type="button" class="button secondary" data-rx-action="previous" disabled>← Étape précédente</button><button type="button" class="button secondary" data-rx-action="next">Étape suivante →</button><button type="button" class="text-button" data-rx-action="reset">Revenir au début</button></div></div>
    <div class="rx-step-list" aria-label="Étapes de l’animation">${['Observer', 'Céder H⁺', 'Capter H⁺', 'Faire le bilan'].map((name,i)=>`<button type="button" data-rx-stage="${i}" ${i===0?'aria-current="step"':''}><span>${i+1}</span>${name}</button>`).join('')}</div>
    <details class="rx-couples"><summary>Retrouver les deux couples acide-base</summary><div class="rx-couple-grid"><div class="rx-family-one"><strong>H₃O⁺ / H₂O</strong><p>L’acide H₃O⁺ donne H⁺ et devient sa base conjuguée H₂O.</p></div><div class="rx-family-two"><strong>NH₄⁺ / NH₃</strong><p>La base NH₃ reçoit H⁺ et devient son acide conjugué NH₄⁺. Le couple s’écrit toujours acide / base.</p></div></div><p class="rx-couples-note">H₃O⁺ et NH₃ réagissent ensemble, mais ils appartiennent à deux couples différents.</p></details>
    <p class="rx-caveat">Les boules représentent les atomes, les traits les liaisons, les crochets et le signe + la charge de l’ion entier. Le H⁺ est montré à part pendant le transfert pour aider à raisonner : dans l’eau, il n’est pas isolé durablement. Les positions et les tailles sont schématiques.</p>
  </section>`;
}

export function mountReaction(root, session = { progress: 0 }) {
  if (!root) return () => {};
  const get = key => root.querySelector(`[data-rx="${key}"]`);
  const position = [0, 1 / 3, 2 / 3, 1];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = false;
  let raf = null;
  let previousTime = null;
  let announcedStage = -1;
  let disposed = false;
  function paint() {
    const f = reactionFrame(session.progress);
    session.progress = f.progress;
    get('proton').setAttribute('transform', `translate(${f.x} ${f.y})`);
    get('proton-label').textContent = f.protonCharge ? 'H⁺' : 'H';
    get('donor-bond').setAttribute('opacity', f.donorBond);
    get('acceptor-bond').setAttribute('opacity', f.acceptorBond);
    get('donor-ion').setAttribute('opacity', f.donorCharge);
    get('acceptor-ion').setAttribute('opacity', f.acceptorCharge);
    get('donor-formula').textContent = f.donorFormula;
    get('acceptor-formula').textContent = f.acceptorFormula;
    get('donor-name').textContent = f.donorCharge ? 'Ion oxonium · acide' : 'Eau · base conjuguée';
    get('acceptor-name').textContent = f.acceptorCharge ? 'Ion ammonium · acide conjugué' : 'Ammoniac · base';
    get('counter').textContent = `ÉTAPE ${f.stage + 1} / 4`;
    get('stage-title').textContent = reactionStages[f.stage].title;
    get('stage-text').textContent = reactionStages[f.stage].text;
    root.querySelectorAll('[data-rx-stage]').forEach(button => {
      if (Number(button.dataset.rxStage) === f.stage) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    const play = root.querySelector('[data-rx-action="play"]');
    play.disabled = reduced.matches;
    play.textContent = reduced.matches ? 'Mode sans mouvement' : playing ? 'Mettre en pause' : f.progress >= 1 ? 'Rejouer l’animation' : f.progress > 0 ? 'Reprendre l’animation' : 'Lire l’animation';
    root.querySelector('[data-rx-action="previous"]').disabled = f.progress <= 0;
    root.querySelector('[data-rx-action="next"]').disabled = f.progress >= 1;
    if (announcedStage !== f.stage) {
      get('live').textContent = `${reactionStages[f.stage].title}. ${reactionStages[f.stage].text}`;
      announcedStage = f.stage;
    }
  }
  function stop() { playing = false; previousTime = null; if (raf !== null) cancelAnimationFrame(raf); raf = null; }
  function tick(time) {
    if (disposed || !playing) return;
    if (previousTime !== null) session.progress = Math.min(1, session.progress + Math.min(time - previousTime, 80) / 12000);
    previousTime = time;
    if (session.progress >= 1) stop();
    paint();
    if (playing) raf = requestAnimationFrame(tick);
  }
  function go(value) { stop(); session.progress = value; paint(); }
  function handleClick(event) {
    const stage = event.target.closest('[data-rx-stage]');
    if (stage) { go(position[Number(stage.dataset.rxStage)]); return; }
    const action = event.target.closest('[data-rx-action]')?.dataset.rxAction;
    if (action === 'play' && !reduced.matches) {
      if (playing) stop(); else { if (session.progress >= 1) session.progress = 0; playing = true; raf = requestAnimationFrame(tick); }
      paint();
    }
    if (action === 'reset') go(0);
    if (action === 'next') go(position.find(p => p > session.progress + 0.001) ?? 1);
    if (action === 'previous') go([...position].reverse().find(p => p < session.progress - 0.001) ?? 0);
  }
  function motionChanged() { if (reduced.matches) stop(); paint(); }
  function visibilityChanged() { if (document.hidden) { stop(); paint(); } }
  root.addEventListener('click', handleClick);
  reduced.addEventListener('change', motionChanged);
  document.addEventListener('visibilitychange', visibilityChanged);
  paint();
  return () => { disposed = true; stop(); root.removeEventListener('click', handleClick); reduced.removeEventListener('change', motionChanged); document.removeEventListener('visibilitychange', visibilityChanged); };
}
