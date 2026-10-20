import { lessons, questions } from './content.js';
import { STORAGE_KEY, skills, isCorrect, makeExam, readState, summarize } from './core.js';
import { reactionPanel, mountReaction } from './reaction.js';
import { moduleTwoLessons, moduleTwoQuestions, moduleTwoSkills, moduleTwoMemo } from './module-two-content.js';
import { moduleTwoHero, moduleTwoReactionPanel, mountModuleTwoReaction } from './module-two-reaction.js';
import { moduleThreeLessons, moduleThreeQuestions, moduleThreeSkills, moduleThreeMemo } from './module-three-content.js';
import { moduleThreeHero, moduleThreePanel, mountModuleThree } from './module-three-models.js';
import { mountInstall } from './install.js';
import { moduleFourLessons, moduleFourQuestions, moduleFourSkills, moduleFourMemo } from './module-four-content.js';
import { moduleFourHero, moduleFourPanel, mountModuleFour } from './module-four-lab.js';

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = id => activeQuestions.find(q => q.id === id);
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const moduleCatalog = [
  { id: '1', title: 'Les couples acide-base', heading: 'Les couples<br><em>acide-base.</em>', intro: 'Un ion H⁺ change de partenaire. Et tout s’éclaire.<br>Observe, essaie, puis construis ton raisonnement.', lessons, questions, skills, storageKey: STORAGE_KEY, time: '15 min', missions: 'Missions 1 et 2 · introduction aux missions 3 et 4' },
  { id: '2', title: 'Réactions et espèces amphotères', heading: 'Une réaction.<br><em>Deux partenaires.</em>', intro: 'Du vinaigre, du bicarbonate… et des bulles.<br>Suis le transfert, construis le bilan, puis change de partenaire.', lessons: moduleTwoLessons, questions: moduleTwoQuestions, skills: moduleTwoSkills, storageKey: 'declic-reactions-amphoteres-v1', time: '20 min', missions: 'Missions 3 et 4 · vinaigre, bicarbonate et amphotères' },
  { id: '3', title: 'Lewis et capture de H⁺', heading: 'Des doublets.<br><em>De nouvelles liaisons.</em>', intro: 'Deux électrons disponibles, une liaison qui se forme.<br>Explore Lewis, puis explique le rôle d’une base.', lessons: moduleThreeLessons, questions: moduleThreeQuestions, skills: moduleThreeSkills, storageKey: 'declic-lewis-protons-v1', time: '20 min', missions: 'Missions 5 et 6 · Lewis, doublets et capture de H⁺' },
  { id:'4', title:'pH et concentration', heading:'Un petit nombre.<br><em>De grands écarts.</em>', intro:'Une unité de pH change la concentration par dix.<br>Observe les rapports, puis apprivoise les calculs.', lessons:moduleFourLessons, questions:moduleFourQuestions, skills:moduleFourSkills, storageKey:'declic-ph-concentration-v1', time:'20 min', missions:'Missions 7 et 8 · pH et concentration en H₃O⁺' }
];
Object.assign(moduleCatalog[0], { shortTitle:'Couples acide-base', hero:pairFigure, panel:()=>reactionPanel(), mount:session=>mountReaction($('reaction-lab'),session), practiceIntro:'Retrouve les espèces conjuguées, écris les couples et vérifie les charges. Chaque réponse t’aide à comprendre.' });
Object.assign(moduleCatalog[1], { shortTitle:'Réactions et amphotères', hero:moduleTwoHero, panel:moduleTwoReactionPanel, mount:session=>mountModuleTwoReaction($('module-two-lab'),session), memo:moduleTwoMemo, practiceIntro:'Identifie les partenaires, construis le bilan et explique les bulles. Puis retrouve les deux rôles des espèces amphotères.' });
Object.assign(moduleCatalog[2], { shortTitle:'Lewis et doublets', hero:moduleThreeHero, panel:moduleThreePanel, mount:session=>mountModuleThree($('lewis-lab'),session), memo:moduleThreeMemo, practiceIntro:'Lis les doublets, vérifie duet et octet, puis explique la capture de H⁺ et les familles acide-base.' });
Object.assign(moduleCatalog[3], { shortTitle:'pH et concentration', hero:moduleFourHero, panel:moduleFourPanel, mount:session=>mountModuleFour($('ph-lab'),session), memo:moduleFourMemo, practiceIntro:'Classe les solutions, compare les concentrations et calcule dans les deux sens. La calculatrice est autorisée ; les indices te guident si tu bloques.' });
let storedModule = '1';
try { storedModule = storage?.getItem('declic-active-module') || '1'; } catch {}
let activeModule = moduleCatalog.find(module => module.id === storedModule) || moduleCatalog[0];
let activeLessons = activeModule.lessons, activeQuestions = activeModule.questions, activeSkills = activeModule.skills, activeStorageKey = activeModule.storageKey;
const moduleOneMemo = $('memo-content').innerHTML;
let state = readState(storage, activeQuestions, activeStorageKey);
let view = 'apprendre';
let practice = null;
let showingExamResult = false;
let activity = freshActivity();
const reactionSessions = { '1': { progress: 0 }, '2': { progress: 0, ampho: 'base', assembled: false }, '3': { progress:0 }, '4':{} };
let disposeReaction = () => {};
function freshActivity() { return { selected: null, hints: 0, attempts: 0, done: false, firstCorrect: null, feedback: null, recorded: false }; }
function save() {
  try { if (!storage) throw new Error(); storage.setItem(activeStorageKey, JSON.stringify(state)); }
  catch { $('save-status').textContent = 'Sauvegarde indisponible · session en cours'; $('save-status').classList.add('warning'); }
}
save();
function pageTop(label) { return `<div class="page-top"><span class="breadcrumb">SÉQUENCE 01 &nbsp; / &nbsp; MODULE ${activeModule.id.padStart(2, '0')}</span><span class="badge">${label}</span></div>`; }
function progress(value, max, label) { return `<div class="progress-track" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${max ? Math.round(value / max * 100) : 0}%"></span></div>`; }
function pairFigure(lesson) { return `<div class="hero-figure ${lesson.pair[0].length > 6 ? 'long-formula' : ''}" aria-label="Exemple de couple : ${lesson.pair.join(' et ')}"><div class="figure-label">DEUX ESPÈCES. UN SEUL H⁺ DE DIFFÉRENCE.</div><div class="pair"><div class="species"><span class="formula">${lesson.pair[0]}</span><small>${lesson.names[0]}</small><span class="species-role">ACIDE</span></div><div class="transfer"><span class="proton">− H⁺</span><span class="arrow" aria-hidden="true">⟶</span><small>cède H⁺</small></div><div class="species"><span class="formula">${lesson.pair[1]}</span><small>${lesson.names[1]}</small><span class="species-role base">BASE CONJUGUÉE</span></div></div><p class="figure-note">Dans l’autre sens, la base capte H⁺ et retrouve son acide.</p></div>`; }
function activeQuestion() {
  if (view === 'apprendre') return byId(activeLessons[state.lesson].question);
  if (view === 'entrainer' && practice && !practice.done) return byId(practice.ids[practice.index]);
  if (view === 'tester' && state.exam && !showingExamResult) return byId(state.exam.ids[state.exam.index]);
  return null;
}
function questionUI(q, exam = false) {
  const selected = activity.selected;
  const numeric=q.type==='number';
  const answerArea = q.type === 'choice' ? `<div class="options" role="group" aria-label="Choix de réponse">${q.options.map((option, i) => {
    let status = selected === i ? ' selected' : '';
    if (activity.done && !exam) { if (i === q.correct) status += ' correct'; else if (i === selected) status += ' wrong'; }
    return `<button type="button" class="option${status}" data-choice="${i}" aria-pressed="${selected === i}" ${activity.done ? 'disabled' : ''}><span class="option-letter" aria-hidden="true">${'ABC'[i]}</span><span>${option}</span></button>`;
  }).join('')}</div>` : `<label class="formula-label" for="formula-answer">${numeric?`Ta valeur (${q.unit})`:'Ta formule'}</label><input class="formula-input" id="formula-answer" name="answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${numeric?'Écris seulement la valeur…':'Écris la formule ici…'}" aria-describedby="input-help" value="${esc(selected ?? '')}" ${activity.done ? 'disabled' : ''}><p class="input-help" id="input-help">${numeric?'Calculatrice autorisée. Virgule ou point acceptés. Pour une puissance de dix : 2,5e-4 ou 2,5 × 10^-4. L’unité est indiquée au-dessus ; ne la recopie pas.':'Au clavier : Na+, SO4^2-. Les indices et charges Unicode sont aussi acceptés. Respecte les majuscules.'}</p>`;
  return `<form id="answer-form"><h3 class="question-title">${q.prompt}</h3>${answerArea}
    ${!exam && activity.hints ? `<div class="hint" role="status"><strong>Indice ${activity.hints} / ${q.hints.length}</strong><br>${q.hints[activity.hints - 1]}</div>` : ''}
    ${activity.feedback && !exam ? `<div class="feedback ${activity.feedback.correct ? '' : 'needs-work'}" role="status" aria-live="polite"><strong>${activity.feedback.correct ? 'Bien vu. Tu as compris le lien !' : 'On reprend ce point ensemble.'}</strong><p>${activity.feedback.text}</p>${activity.feedback.correct ? '' : `<p>${q.explanation}</p>`}</div>` : ''}
    <div class="actions">${exam ? '<span class="muted"><small>La correction arrive à la fin.</small></span>' : `<button type="button" class="text-button" data-action="hint" ${activity.done || activity.hints >= q.hints.length ? 'disabled' : ''}>${activity.hints ? 'Un autre indice' : '☼ Un petit indice'}${activity.hints >= q.hints.length ? ' · tous lus' : ''}</button>`}
    ${activity.done ? `<button type="button" class="button" data-action="next">${view === 'apprendre' ? (state.lesson === 3 ? 'Passer à l’entraînement' : 'Étape suivante') : practice.index === practice.ids.length - 1 ? 'Voir mon bilan' : 'Question suivante'} <span aria-hidden="true">→</span></button>` : `<button type="submit" class="button" id="validate-answer" ${selected === null || selected === '' ? 'disabled' : ''}>${exam ? (state.exam.index === 7 ? 'Terminer le test' : 'Enregistrer et continuer') : 'Vérifier ma réponse'} <span aria-hidden="true">→</span></button>`}</div>
  </form>`;
}
function learnPage() {
  const lesson = activeLessons[state.lesson];
  return `${pageTop('Apprentissage guidé')}<section class="hero"><div class="hero-copy"><span class="eyebrow">COMPRENDRE, UN DÉCLIC À LA FOIS.</span><h1>${activeModule.heading}</h1><p class="intro-line">${activeModule.intro}</p><div class="hero-meta"><span>◷ &nbsp; Environ ${activeModule.time}</span><span>4 étapes à ton rythme</span><span>Terminale</span></div></div>${activeModule.hero(lesson)}</section>
  ${activeModule.panel(state.lesson)}
  <div class="learning-grid"><section class="journey" aria-label="Étapes du parcours"><h2 class="journey-heading">Ton chemin vers le déclic</h2><p class="journey-subtitle">Une idée, un exemple, à toi de jouer.</p><div class="journey-list">${activeLessons.map((l, i) => `<button class="lesson-link ${i === state.lesson ? 'current' : ''} ${state.completed.includes(i) ? 'complete' : ''}" data-lesson="${i}" ${i === state.lesson ? 'aria-current="step"' : ''}><span class="step-number">${state.completed.includes(i) ? '✓' : `0${i + 1}`}</span><span><strong>${l.title}</strong><small>${l.short} · ${l.duration}</small></span></button>`).join('')}</div><div class="journey-progress"><div><span>Étapes validées</span><strong>${state.completed.length} / 4</strong></div>${progress(state.completed.length, 4, 'Étapes validées')}</div></section>
    <section class="lesson-card"><span class="eyebrow">ÉTAPE 0${state.lesson + 1} &nbsp; · &nbsp; ${lesson.tag}</span><h2>${lesson.title}</h2><p class="lesson-description">${lesson.intro}</p><div class="rule"><strong>${lesson.rule}</strong></div><p class="lesson-detail">${lesson.detail}</p><div class="note"><span aria-hidden="true">↳</span><div>${lesson.note}</div></div><div class="exercise-divider"></div><div class="exercise-label"><span>À TOI DE JOUER</span><span class="muted">Tu peux demander un indice.</span></div>${questionUI(activeQuestion())}</section></div>`;
}
function startPage(exam) {
  return `${pageTop(exam ? 'En autonomie' : 'Avec un coup de pouce')}<section class="section-intro"><span class="eyebrow">${exam ? 'FAIS LE POINT, SANS PRESSION.' : 'C’EST EN ESSAYANT QUE ÇA SE FIXE.'}</span><h1>${exam ? 'Prêt pour le déclic ?' : 'À toi de faire les liens.'}</h1><p class="intro-line">${exam ? 'Huit questions pour voir ce que tu sais faire seul. Prends ton temps : il n’y a pas de chronomètre.' : activeModule.practiceIntro}</p></section><div class="start-grid"><section class="start-panel"><h2>${exam ? 'Ton test de compréhension' : 'Un entraînement accompagné'}</h2><ul class="checklist"><li>8 questions, réparties sur les 4 compétences</li><li>${exam ? 'Sans indice ni correction pendant le test' : activeModule.id==='4'?'Des choix et des valeurs numériques à saisir':'Des choix et des formules à saisir'}</li><li>${exam ? 'Toutes les réponses expliquées à la fin' : 'Deux indices disponibles pour chaque question'}</li><li>${exam ? 'Tu peux quitter cette page et reprendre plus tard' : 'Une correction pour comprendre chaque erreur'}</li></ul><button class="button" data-action="${exam ? 'start-exam' : 'start-practice'}">${exam ? 'Commencer le test' : 'Commencer l’entraînement'} <span aria-hidden="true">→</span></button></section><aside class="quiet-card"><div class="big-symbol" aria-hidden="true">${exam ? 'H⁺' : '↔'}</div><h3>${exam ? 'Pas besoin de tout réussir.' : 'L’erreur fait partie du chemin.'}</h3><p>${exam ? 'Le bilan sert à choisir ce qu’il faut revoir. Un résultat est un repère, pas une étiquette.' : 'Essaie d’abord avec ce que tu sais. Puis utilise un indice si tu en as besoin : l’important est de comprendre pourquoi.'}</p></aside></div>`;
}
function sessionPage(exam) {
  const session = exam ? state.exam : practice;
  return `${pageTop(exam ? 'Test en cours' : 'Entraînement en cours')}<section class="section-intro"><span class="eyebrow">${exam ? 'FAIS CONFIANCE À TON RAISONNEMENT.' : 'CHAQUE ESSAI TE FAIT AVANCER.'}</span><h1>${exam ? 'Voyons ce qui est acquis.' : 'Pratique le déclic.'}</h1></section><div class="session-progress"><div class="session-top"><strong>Question ${session.index + 1} sur ${session.ids.length}</strong><span>${exam ? 'Sans aide · à ton rythme' : activeSkills[activeQuestion().skill]}</span></div>${progress(session.index, session.ids.length, 'Questions terminées')}</div>${exam && session.index ? '<div class="saved-banner" role="status">Réponse précédente enregistrée. La correction sera disponible à la fin.</div>' : ''}<section class="question-card"><div class="exercise-label"><span>${exam ? 'À TOI DE RÉPONDRE' : 'CONSTRUIS TON RAISONNEMENT'}</span><span class="muted">${activeQuestion().type === 'number' ? 'Calcule une valeur' : activeQuestion().type === 'formula' ? 'Écris une formule' : 'Une seule réponse attendue'}</span></div>${questionUI(activeQuestion(), exam)}</section>`;
}
function reviewItems(records) { return records.map((r, i) => {
  const q = byId(r.id); const correctAnswer = q.type !== 'choice' ? q.answers[0] : q.options[q.correct];
  const given = q.type !== 'choice' ? r.answer : q.options[r.answer];
  return `<details class="review-item ${r.correct ? '' : 'incorrect'}"><summary><span class="review-status">${r.correct ? '✓' : '↻'}</span>${i + 1}. ${q.prompt}</summary><div class="review-body"><p><strong>Ta réponse :</strong> ${esc(given ?? 'Réponse non conservée')}${r.assisted ? ' · avec aide ou après correction' : ''}</p><p><strong>Réponse attendue :</strong> ${esc(correctAnswer)}</p><p>${q.explanation}</p></div></details>`;
}).join(''); }
function resultPage(exam) {
  const records = exam ? state.lastExam.answers : practice.answers;
  const score = records.filter(r => r.correct && !r.assisted).length;
  return `${pageTop(exam ? 'Test terminé' : 'Entraînement terminé')}<div class="result-header"><span class="eyebrow">CHAQUE RÉPONSE EST UN REPÈRE.</span><div class="score">${score}<small> / ${records.length}</small></div><h1>${score >= 6 ? 'Les liens se construisent.' : 'Tu sais maintenant quoi retravailler.'}</h1><p>${exam ? 'Réponses correctes au test, sans aide.' : 'Réponses correctes au premier essai et sans indice.'}<br>Ouvre une question pour retrouver son explication.</p></div><div class="result-details">${reviewItems(records)}</div><div class="result-actions"><a class="button" href="#bilan">Voir mes compétences →</a><button class="button secondary" data-action="${exam ? 'start-exam' : 'start-practice'}">${exam ? 'Faire un nouveau test' : 'Un nouvel entraînement'}</button></div>`;
}
function dashboard() {
  const recent = state.history.slice(-40);
  const stats = summarize(recent, activeQuestions);
  const count = state.history.length;
  const rate = recent.length ? Math.round(recent.filter(r => r.correct && !r.assisted).length / recent.length * 100) : null;
  const lastScore = state.lastExam ? state.lastExam.answers.filter(r => r.correct).length : null;
  const weakest = Object.entries(stats).filter(([, s]) => s.total).sort((a,b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0];
  const target = weakest ? Object.keys(activeSkills).indexOf(weakest[0]) : state.completed.length < 4 ? activeLessons.findIndex((_, i) => !state.completed.includes(i)) : 0;
  return `${pageTop('Tes repères')}<section class="section-intro"><span class="eyebrow">LE CHEMIN COMPTE AUSSI.</span><h1>Ton déclic prend forme.</h1><p class="intro-line">Voici ce que tes essais nous apprennent. Reviens sur une notion, entraîne-toi, puis vérifie si tu peux réussir sans aide.</p></section><div class="stat-grid"><div class="stat"><div class="number">${state.completed.length}<span class="muted"> / 4</span></div><div class="label">étapes du cours validées</div></div><div class="stat"><div class="number">${count}</div><div class="label">questions travaillées</div></div><div class="stat"><div class="number">${rate === null ? '—' : `${rate}<span class="muted"> %</span>`}</div><div class="label">réussite au premier essai, sans aide</div></div></div><div class="dashboard-grid"><section class="panel"><h2>Les quatre compétences</h2><p>Sur les ${recent.length} dernières réponses (40 maximum). Un indice ou une erreur au premier essai indique un point à consolider.</p>${Object.entries(activeSkills).map(([key, name]) => { const s = stats[key]; const percent = s.total ? Math.round(s.correct / s.total * 100) : 0; return `<div class="skill-row"><div><strong>${name}</strong><small>${s.total ? `${s.correct} / ${s.total} sans aide` : 'Pas encore travaillé'}</small></div>${progress(s.correct, s.total || 1, `${name} : ${percent} %` )}</div>`; }).join('')}</section><section><div class="recommendation"><span class="eyebrow">TON PROCHAIN PETIT PAS</span><h3>${weakest ? activeSkills[weakest[0]] : 'Commencer par comprendre'}</h3><p>${weakest ? 'Reprends cette étape avec l’exemple, puis vérifie ton raisonnement dans un nouvel entraînement.' : 'Quelques questions suffiront pour faire apparaître tes premiers repères.'}</p><button class="button" data-lesson="${target}">Revoir l’étape ${target + 1} →</button></div><div class="panel"><h2>Ton dernier test</h2>${lastScore === null ? '<p>Pas encore de test terminé. Il sera disponible quand tu voudras faire le point.</p><a class="text-button" href="#tester">Découvrir le test →</a>' : `<p><strong>${lastScore} / 8</strong> réponses correctes, sans aide.</p><button class="text-button" data-action="last-result">Revoir la correction →</button>`}</div></section></div><div class="reset-area">Progression conservée dans ce navigateur, sur cet appareil. Aucun compte élève requis.<br><button class="text-button" data-action="reset">Effacer la progression de ce module</button></div>`;
}
function render(focus = false) {
  disposeReaction();
  syncModuleChrome();
  $('open-memo').hidden = view === 'tester' && state.exam !== null && !showingExamResult;
  document.querySelectorAll('#nav a').forEach(a => { const active = a.dataset.view === view; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('main').innerHTML = view === 'apprendre' ? learnPage() : view === 'bilan' ? dashboard() : view === 'entrainer' ? (practice ? practice.done ? resultPage(false) : sessionPage(false) : startPage(false)) : showingExamResult && state.lastExam ? resultPage(true) : state.exam ? sessionPage(true) : startPage(true);
  disposeReaction = activeModule.mount(reactionSessions[activeModule.id]);
  if (focus) { $('main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}
function route() {
  const hash = location.hash.slice(1);
  view = ['apprendre', 'entrainer', 'tester', 'bilan'].includes(hash) ? hash : 'apprendre';
  activity = freshActivity();
  render(true);
}
function record(q, answer, correct, assisted, mode) { return { id: q.id, answer, correct, assisted, mode, date: new Date().toISOString() }; }
function appendHistory(records) { state.history.push(...records); state.history = state.history.slice(-300); }
function submitAnswer() {
  const q = activeQuestion();
  if (!q || activity.done || activity.selected === null || activity.selected === '') return;
  const answer = activity.selected;
  const correct = isCorrect(q, answer);
  if (view === 'tester') {
    state.exam.answers.push(record(q, answer, correct, false, 'test'));
    if (state.exam.index === state.exam.ids.length - 1) {
      state.lastExam = { answers: state.exam.answers, date: new Date().toISOString() };
      appendHistory(state.exam.answers); state.exam = null; showingExamResult = true;
    } else { state.exam.index++; }
    save(); activity = freshActivity(); render(true); return;
  }
  if (activity.attempts === 0) activity.firstCorrect = correct;
  activity.attempts++;
  activity.feedback = { correct, text: q.type === 'choice' ? q.feedback[answer] : correct ? q.explanation : q.type==='number' ? 'Vérifie la relation, les puissances de dix et l’arrondi demandé. La correction ci-dessous détaille le calcul.' : 'Compare le nombre de H et la charge. La correction ci-dessous t’aide à retrouver la formule.' };
  if (view === 'apprendre' && !correct) {
    activity.selected = null;
    render();
    $('main').querySelector('.feedback')?.scrollIntoView({ block: 'nearest' });
    return;
  }
  activity.done = true;
  const result = record(q, answer, activity.firstCorrect, activity.hints > 0 || activity.attempts > 1, view === 'apprendre' ? 'cours' : 'entrainement');
  appendHistory([result]);
  if (view === 'apprendre') { if (!state.completed.includes(state.lesson)) state.completed.push(state.lesson); }
  else { practice.answers.push(result); }
  save(); render();
  $('main').querySelector('.feedback')?.scrollIntoView({ block: 'nearest' });
}
$('main').addEventListener('click', event => {
  const choice = event.target.closest('[data-choice]');
  if (choice && !activity.done) {
    activity.selected = Number(choice.dataset.choice);
    $('main').querySelectorAll('[data-choice]').forEach(b => { const selected = Number(b.dataset.choice) === activity.selected; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', String(selected)); });
    $('validate-answer').disabled = false; return;
  }
  const lessonButton = event.target.closest('[data-lesson]');
  if (lessonButton) {
    state.lesson = Number(lessonButton.dataset.lesson); save(); activity = freshActivity();
    if (view !== 'apprendre') location.hash = 'apprendre'; else render();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'hint') { const q = activeQuestion(); if (q && activity.hints < q.hints.length && !activity.done) { activity.hints++; render(); } }
  if (action === 'next' && activity.done) {
    activity = freshActivity();
    if (view === 'apprendre') {
      if (state.lesson < 3) { state.lesson++; save(); render(true); }
      else { location.hash = 'entrainer'; }
    } else if (view === 'entrainer') {
      if (practice.index === practice.ids.length - 1) practice.done = true; else practice.index++;
      render(true);
    }
  }
  if (action === 'start-practice') { practice = { ids: makeExam(activeQuestions), index: 0, answers: [], done: false }; activity = freshActivity(); render(true); }
  if (action === 'start-exam') {
    state.exam = { ids: makeExam(activeQuestions), index: 0, answers: [] }; showingExamResult = false; activity = freshActivity(); save(); render(true);
  }
  if (action === 'last-result') { showingExamResult = true; location.hash = 'tester'; }
  if (action === 'reset' && window.confirm('Effacer les étapes, réponses et résultats du module sélectionné sur cet appareil ?')) {
    try { storage?.removeItem(activeStorageKey); } catch { /* Session memory remains available. */ }
    state = readState(null, activeQuestions); practice = null; showingExamResult = false; activity = freshActivity(); save(); render(true);
  }
});
$('main').addEventListener('input', event => {
  if (event.target.id !== 'formula-answer') return;
  activity.selected = event.target.value.trim();
  $('validate-answer').disabled = !activity.selected;
});
$('main').addEventListener('submit', event => { if (event.target.id === 'answer-form') { event.preventDefault(); submitAnswer(); } });
$('open-memo').addEventListener('click', () => $('memo-dialog').showModal());
$('close-memo').addEventListener('click', () => $('memo-dialog').close());
$('memo-dialog').addEventListener('click', event => { if (event.target === $('memo-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });
function syncModuleChrome() {
  $('module-select').value = activeModule.id;
  document.querySelector('.module-pill').textContent = `Module ${activeModule.id} · ${activeModule.shortTitle}`;
  document.querySelector('.desktop-only strong').textContent = activeModule.title;
  document.title = `Déclic — Module ${activeModule.id} · ${activeModule.title}`;
  $('memo-content').innerHTML = activeModule.memo || moduleOneMemo;
}
function switchModule(id) {
  const nextModule = moduleCatalog.find(module => module.id === id);
  if (!nextModule || nextModule.id === activeModule.id) return;
  save(); disposeReaction();
  activeModule = nextModule;
  activeLessons = nextModule.lessons; activeQuestions = nextModule.questions; activeSkills = nextModule.skills; activeStorageKey = nextModule.storageKey;
  state = readState(storage, activeQuestions, activeStorageKey);
  practice = null; showingExamResult = false; activity = freshActivity();
  try { storage?.setItem('declic-active-module', activeModule.id); } catch {}
  history.replaceState(null, '', '#apprendre'); view = 'apprendre'; save(); render(true);
}
$('module-select').addEventListener('change', event => switchModule(event.target.value));
window.addEventListener('hashchange', route);
mountInstall();
route();
