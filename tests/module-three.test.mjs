import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleThreeLessons,moduleThreeQuestions,moduleThreeSkills} from '../module-three-content.js';
import {m3Molecules,m3CaptureFrame,m3FamilyModel} from '../module-three-models.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {emptyState,readState,makeExam,isCorrect} from '../core.js';
test('module 3 provides four guided lessons and 24 valid questions',()=>{
  assert.equal(moduleThreeLessons.length,4);assert.equal(new Set(moduleThreeQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleThreeSkills))assert.equal(moduleThreeQuestions.filter(q=>q.skill===skill).length,6);
  for(const lesson of moduleThreeLessons)assert.ok(moduleThreeQuestions.some(q=>q.id===lesson.question));
  for(const q of moduleThreeQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(q.feedback.length,q.options.length);}else assert.ok(q.answers.length);}
});
test('module 3 tests use two questions per skill without other modules',()=>{
  for(let i=0;i<30;i++){const ids=makeExam(moduleThreeQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleThreeSkills))assert.equal(ids.filter(id=>moduleThreeQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('all three progress stores and pending tests remain separate',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions];const keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1'];
  const data=new Map(banks.map((bank,i)=>[keys[i],JSON.stringify({...emptyState(),completed:[i],exam:{ids:makeExam(bank),index:0,answers:[]}})]));const store={getItem:key=>data.get(key)};
  for(let i=0;i<3;i++){const state=readState(store,banks[i],keys[i]);assert.deepEqual(state.completed,[i]);assert.equal(state.exam.ids.length,8);assert.ok(state.exam.ids.every(id=>banks[i].some(q=>q.id===id)));}
});
test('protonation and deprotonation formulas require correct charges',()=>{
  for(const [id,correct,wrong] of [['m3-c3','NH₄⁺','NH4'],['m3-f2','CH3NH3+','CH3NH2+'],['m3-f4','CH₃COO⁻','CH3COOH']]){const q=moduleThreeQuestions.find(q=>q.id===id);assert.ok(isCorrect(q,correct));assert.equal(isCorrect(q,wrong),false);}
});
test('Lewis species and capture model conserve octet, electron pairs and total charge',()=>{
  for(const m of Object.values(m3Molecules))assert.equal(2*(m.bonds+m.lone),8);
  for(const direction of ['capture','release'])for(let i=0;i<=100;i++){const f=m3CaptureFrame(i/100,direction);assert.equal(f.bondPairs+f.lonePairs,4);assert.equal(f.electrons,8);assert.equal(f.charge,1);assert.ok(f.proton.every(Number.isFinite));}
  assert.equal(m3CaptureFrame(0).lonePairs,1);assert.equal(m3CaptureFrame(1).lonePairs,0);assert.equal(m3CaptureFrame(0,'release').bondPairs,4);assert.equal(m3CaptureFrame(1,'release').bondPairs,3);
});
test('family transformations preserve the central octet and total charge',()=>{
  for(const family of ['amine','acid']){const before=m3FamilyModel(family);const after=m3FamilyModel(family,true);assert.equal(before.bonds+before.lone,4);assert.equal(after.bonds+after.lone,4);assert.equal(before.charge+before.protonCharge,after.charge+after.protonCharge);}
});
