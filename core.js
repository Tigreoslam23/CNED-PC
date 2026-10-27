export const STORAGE_KEY = 'declic-acide-base-v1';
export const skills = { role: 'Céder ou capter H⁺', conjugue: 'Trouver l’espèce conjuguée', ordre: 'Écrire un couple', charge: 'Vérifier les charges' };
export function normalizeFormula(value) {
  return String(value).normalize('NFKC').replace(/[−–‐]/g, '-').replace(/[\s^{}()]/g, '').replace(/OH-/g, 'HO-');
}
export function isCorrect(question, answer) {
  if (question.type === 'number') {
    const value = parseNumericAnswer(answer);
    return Number.isFinite(value) && Math.abs(value - question.value) <= Math.max(question.tolerance || 0, Math.abs(question.value) * (question.relativeTolerance || 0)) + Number.EPSILON * Math.abs(question.value);
  }
  return question.type === 'formula'
    ? question.answers.some(expected => normalizeFormula(expected) === normalizeFormula(answer))
    : Number.isInteger(answer) && answer === question.correct;
}
export function parseNumericAnswer(input) {
  let text = String(input ?? '').trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, part => '^' + part.normalize('NFKC')).replace(/[−–]/g, '-').replace(/\s/g, '').replace(/,/g, '.').replace(/[×·]/g, '*').replace(/[()]/g, '');
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return Number(text);
  const power = text.match(/^(?:([+-]?(?:\d+(?:\.\d*)?|\.\d+))\*)?10\^([+-]?\d+)$/);
  return power ? Number(`${power[1] ?? 1}e${power[2]}`) : NaN;
}
export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function makeExam(bank, random = Math.random) {
  const bankSkills = [...new Set(bank.map(q => q.skill))];
  return shuffle(bankSkills.flatMap(skill => shuffle(bank.filter(q => q.skill === skill), random).slice(0, 2)), random).map(q => q.id);
}
export function emptyState() { return { version: 1, lesson: 0, completed: [], history: [], exam: null, lastExam: null }; }
export function readState(storage, bank, storageKey = STORAGE_KEY) {
  try {
    const value = JSON.parse(storage.getItem(storageKey));
    if (!value || value.version !== 1) return emptyState();
    const validIds = new Set(bank.map(q => q.id));
    const cleanRecords = records => Array.isArray(records) ? records.filter(r => r && validIds.has(r.id) && typeof r.correct === 'boolean' && typeof r.assisted === 'boolean') : [];
    const state = { ...emptyState(), lesson: Number.isInteger(value.lesson) ? Math.max(0, Math.min(3, value.lesson)) : 0,
      completed: Array.isArray(value.completed) ? [...new Set(value.completed.filter(n => Number.isInteger(n) && n >= 0 && n < 4))] : [],
      history: cleanRecords(value.history).slice(-300) };
    if (value.lastExam && Array.isArray(value.lastExam.answers)) {
      const answers = cleanRecords(value.lastExam.answers);
      if (answers.length === 8 && new Set(answers.map(r => r.id)).size === 8) state.lastExam = { answers, date: String(value.lastExam.date || '') };
    }
    const e = value.exam;
    if (e && Array.isArray(e.ids) && e.ids.length === 8 && new Set(e.ids).size === 8 && e.ids.every(id => validIds.has(id)) && Number.isInteger(e.index) && e.index >= 0 && e.index < 8) {
      const answers = cleanRecords(e.answers);
      if (answers.length === e.index && answers.every((r, i) => r.id === e.ids[i])) state.exam = { ids: e.ids, index: e.index, answers };
    }
    return state;
  } catch { return emptyState(); }
}
export function summarize(records, bank) {
  const totals = Object.fromEntries([...new Set(bank.map(q => q.skill))].map(key => [key, { total: 0, correct: 0 }]));
  for (const record of records) {
    const question = bank.find(q => q.id === record.id);
    if (!question) continue;
    totals[question.skill].total++;
    if (record.correct && !record.assisted) totals[question.skill].correct++;
  }
  return totals;
}
