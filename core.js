export const STORAGE_KEY = 'declic-acide-base-v1';
export const skills = { role: 'Céder ou capter H⁺', conjugue: 'Trouver l’espèce conjuguée', ordre: 'Écrire un couple', charge: 'Vérifier les charges' };
export function normalizeFormula(value) {
  return String(value).normalize('NFKC').replace(/[−–‐]/g, '-').replace(/[\s^{}()]/g, '').replace(/OH-/g, 'HO-');
}
export function isCorrect(question, answer) {
  return question.type === 'formula'
    ? question.answers.some(expected => normalizeFormula(expected) === normalizeFormula(answer))
    : Number.isInteger(answer) && answer === question.correct;
}
export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function makeExam(bank, random = Math.random) {
  return shuffle(Object.keys(skills).flatMap(skill => shuffle(bank.filter(q => q.skill === skill), random).slice(0, 2)), random).map(q => q.id);
}
export function emptyState() { return { version: 1, lesson: 0, completed: [], history: [], exam: null, lastExam: null }; }
export function readState(storage, bank) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY));
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
  const totals = Object.fromEntries(Object.keys(skills).map(key => [key, { total: 0, correct: 0 }]));
  for (const record of records) {
    const question = bank.find(q => q.id === record.id);
    if (!question) continue;
    totals[question.skill].total++;
    if (record.correct && !record.assisted) totals[question.skill].correct++;
  }
  return totals;
}
