import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions, lessons } from '../content.js';
import { isCorrect, normalizeFormula, makeExam, summarize, readState, emptyState } from '../core.js';
test('the bank covers four skills and every lesson references a valid question', () => {
  assert.equal(new Set(questions.map(q => q.id)).size, 24);
  for (const s of ['role','conjugue','ordre','charge']) assert.equal(questions.filter(q => q.skill === s).length, 6);
  for (const l of lessons) assert.ok(questions.some(q => q.id === l.question));
  for (const q of questions.filter(q => q.type === 'choice')) { assert.ok(q.correct >= 0 && q.correct < q.options.length); assert.equal(q.feedback.length, q.options.length); }
});
test('formula grading accepts equivalent typography but rejects missing or wrong charges', () => {
  const carbonate = questions.find(q => q.id === 'conjugue-6');
  for (const text of ['CO3^2-', 'CO₃²⁻', ' CO3 ^{2-} ']) assert.equal(isCorrect(carbonate, text), true);
  for (const text of ['CO3-', 'HCO3-', 'CO3^2+', 'co3^2-']) assert.equal(isCorrect(carbonate, text), false);
  assert.equal(normalizeFormula('OH⁻'), normalizeFormula('HO-'));
  assert.equal(isCorrect(questions[0], null), false);
});
test('a test always has eight unique questions and two for each skill', () => {
  for (let i=0; i<100; i++) {
    const exam = makeExam(questions); assert.equal(new Set(exam).size, 8);
    for (const s of ['role','conjugue','ordre','charge']) assert.equal(exam.filter(id => questions.find(q => q.id === id).skill === s).length, 2);
  }
});
test('assisted success does not become independent mastery', () => {
  const rows = [{id:'role-1',correct:true,assisted:true},{id:'role-2',correct:true,assisted:false},{id:'role-3',correct:false,assisted:false}];
  assert.deepEqual(summarize(rows, questions).role, {total:3,correct:1});
});
test('storage corruption and blocked storage recover safely', () => {
  assert.deepEqual(readState(null, questions), emptyState());
  assert.deepEqual(readState({getItem(){throw new Error('blocked');}},questions),emptyState());
  assert.deepEqual(readState({getItem(){return 'not json';}},questions),emptyState());
  const dirty = {version:1, lesson:999, completed:[0,0,-1,3,10], history:[null,{id:'bogus',correct:true,assisted:false}], exam:{ids:['bogus'],index:0,answers:[]}};
  const clean = readState({getItem:()=>JSON.stringify(dirty)}, questions);
  assert.equal(clean.lesson,3); assert.deepEqual(clean.completed,[0,3]); assert.deepEqual(clean.history,[]); assert.equal(clean.exam,null);
});
test('an in-progress exam can be restored with answers in order', () => {
  const ids = makeExam(questions); const e = { ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:0}] };
  const restored = readState({getItem:()=>JSON.stringify({...emptyState(),exam:e})},questions);
  assert.deepEqual(restored.exam,e);
});
