import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleFiveLessons,moduleFiveQuestions,moduleFiveSkills} from '../module-five-content.js';
import {m5Standards,m5Optics,m5Calibration,m5Reading,m5Dilution} from '../module-five-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {isCorrect,emptyState,readState,makeExam} from '../core.js';
test('module 5 has four lessons and 24 valid questions across its four skills',()=>{
  assert.equal(moduleFiveLessons.length,4);assert.equal(new Set(moduleFiveQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleFiveSkills))assert.equal(moduleFiveQuestions.filter(q=>q.skill===skill).length,6);
  for(const l of moduleFiveLessons)assert.ok(moduleFiveQuestions.some(q=>q.id===l.question));
  for(const q of moduleFiveQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(q.feedback.length,q.options.length);}else{assert.equal(q.type,'number');assert.ok(isCorrect(q,String(q.value)));assert.ok(q.unit);assert.ok(q.answers[0]);}}
});
test('the optical model respects transmission, logarithmic absorbance and Beer-Lambert with coherent units',()=>{
  for(let i=0;i<=30;i++)for(const length of [1,2]){const c=i/10;const m=m5Optics(c,length);assert.ok(m.transmittance>0&&m.transmittance<=1);assert.ok(m.transmitted<=m.incident);assert.ok(Math.abs(m.absorbance+Math.log10(m.transmittance))<1e-12);assert.equal(m.cMol,c/1000);assert.equal(m.absorbance,m.k*m.cMol);}
  assert.equal(m5Optics(0).transmittance,1);assert.equal(m5Optics(2).absorbance,.4);assert.equal(m5Optics(2,2).absorbance,.8);assert.ok(m5Optics(2,2).transmitted<m5Optics(2,1).transmitted);
  for(const args of [[-1,1],[4,1],[NaN,1],[1,0],[1,Infinity]])assert.equal(m5Optics(...args),null);
});
test('calibration standards agree with the cuvette model and chart projection coordinates',()=>{
  for(const point of m5Standards){assert.ok(Math.abs(m5Optics(point.c).absorbance-point.a)<1e-12);assert.ok(Math.abs(m5Calibration(point.a)-point.c)<1e-12);}
  const middle=m5Reading(.3);assert.ok(Math.abs(middle.c-1.5)<1e-12);assert.equal(middle.x,310);assert.equal(middle.y,195);
  const end=m5Reading(.6);assert.ok(Math.abs(end.x-550)<1e-12);assert.equal(end.y,60);assert.ok(Math.abs(end.c-3)<1e-12);
  for(const invalid of [-.1,.61,NaN,Infinity]){assert.ok(Number.isNaN(m5Calibration(invalid)));assert.equal(m5Reading(invalid),null);}
});
test('dilution preserves the amount in the aliquot and reverses the concentration reduction',()=>{
  for(const vp of [5,10,20])for(const vf of [50,100,200])for(const a of [0,.1,.3,.6]){const m=m5Dilution(vp,vf,a);assert.ok(m.factor>1);assert.equal(m.factor,vf/vp);assert.ok(Math.abs(m.initial*vp-m.diluted*vf)<1e-10);assert.ok(Math.abs(m.amountBefore-m.amountAfter)<1e-12);}
  const m=m5Dilution(10,100,.3);assert.ok(Math.abs(m.initial-15)<1e-12);assert.ok(Math.abs(m.amountBefore-.15)<1e-12);
  for(const args of [[0,100,.3],[100,10,.3],[10,10,.3],[10,100,1.2],[NaN,100,.3]])assert.equal(m5Dilution(...args),null);
});
test('grading accepts decimal and scientific answers while rejecting reversed dilution and unit factors',()=>{
  assert.ok(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-l1'),'0,20'));assert.ok(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-b5'),'2 × 10⁻³'));
  assert.equal(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-b5'),'2'),false);
  assert.ok(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-d1'),'15'));assert.equal(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-d1'),'0,15'),false);
  assert.equal(isCorrect(moduleFiveQuestions.find(q=>q.id==='m5-e1'),'0,0015'),false);
});
test('module 5 tests remain balanced and distinct from the previous banks',()=>{
  for(let i=0;i<40;i++){const ids=makeExam(moduleFiveQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleFiveSkills))assert.equal(ids.filter(id=>moduleFiveQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('all five module stores preserve lessons, pending tests and numeric answers independently',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions];const keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1','declic-lumiere-etalonnage-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i%4,completed:[i%4],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'0,20'}]}};});const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)]));const store={getItem:key=>data.get(key)};
  for(let i=0;i<5;i++){const restored=readState(store,banks[i],keys[i]);assert.deepEqual(restored.completed,originals[i].completed);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
