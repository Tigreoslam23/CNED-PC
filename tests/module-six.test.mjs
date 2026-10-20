import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleSixLessons,moduleSixQuestions,moduleSixSkills} from '../module-six-content.js';
import {m6Standards,m6Solution,m6IonFrame,m6Convert,m6Reading} from '../module-six-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {moduleFiveQuestions} from '../module-five-content.js';
import {isCorrect,emptyState,readState,makeExam} from '../core.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≈ ${b}`);
test('module 6 provides four linked lessons and 24 gradable questions across four skills',()=>{
  assert.equal(moduleSixLessons.length,4);assert.equal(new Set(moduleSixQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleSixSkills))assert.equal(moduleSixQuestions.filter(q=>q.skill===skill).length,6);
  for(const l of moduleSixLessons)assert.ok(moduleSixQuestions.some(q=>q.id===l.question));
  for(const q of moduleSixQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(isCorrect(q,q.correct));assert.equal(q.feedback.length,q.options.length);}else{assert.ok(isCorrect(q,String(q.value)));assert.ok(q.unit);assert.ok(q.answers[0]);}}
});
test('Kohlrausch adds unequal Na and Cl contributions and doubles conductivity with concentration',()=>{
  const m=m6Solution(1.5);close(m.sodium,.0075);close(m.chloride,.0114);close(m.sigma,.0189);assert.ok(m.chloride>m.sodium);close(m6Solution(3).sigma,2*m.sigma);
  for(let i=0;i<=30;i++){const s=m6Solution(i/10);close(s.sigma,s.sodium+s.chloride);close(s.sigma,.0126*i/10);assert.ok(s.pairs>=0&&s.pairs<=12);}
  assert.equal(m6Solution(0).sigma,0);assert.equal(m6Solution(0).pairs,0);
  for(const args of [[-1,100],[3.1,100],[NaN,100],[1,0],[1,Infinity]])assert.equal(m6Solution(...args),null);
});
test('cell geometry changes conductance and current but preserves solution conductivity',()=>{
  const a=m6Solution(1.5,100),b=m6Solution(1.5,200);close(a.sigma,b.sigma);close(b.g,a.g/2);close(a.current,a.g*1);close(a.sigma,100*a.g);close(a.g*1000,.189);
});
test('alternating field gives opposite periodic bounded ion displacements without drift',()=>{
  for(let i=0;i<100;i++){const t=i/100,a=m6IonFrame(t),b=m6IonFrame(t+1);close(a.sodium,-a.chloride);close(a.sodium,b.sodium);assert.ok(Math.abs(a.sodium)<=16);assert.ok([-1,1].includes(a.direction));}
  close(m6IonFrame(.25).sodium,16);close(m6IonFrame(.75).sodium,-16);assert.equal(m6IonFrame(0).direction,-m6IonFrame(.5).direction);
});
test('unit conversions preserve the mmol per litre equivalence and the milli prefix',()=>{
  close(m6Convert(1.5,'mm'),1.5);close(m6Convert(.002,'mol'),2);close(m6Convert(18.9,'ms'),.0189);close(m6Convert(.0189,'si'),18.9);
  for(const v of [0,.001,1.5,100])close(m6Convert(m6Convert(v,'ms'),'si'),v);
  for(const args of [[-1,'mm'],[NaN,'ms'],[Infinity,'mol'],[1,'unknown']])assert.ok(Number.isNaN(m6Convert(...args)));
});
test('calibration agrees with SI model and chart endpoints and reverses dilution',()=>{
  for(const point of m6Standards){close(m6Solution(point.c).sigma*1000,point.sigma);close(m6Reading(point.sigma).c,point.c);}
  const p=m6Reading(18.9,5);close(p.c,1.5);close(p.initial,7.5);close(p.x,310);close(p.y,195);close(m6Reading(37.8).x,550);close(m6Reading(37.8).y,60);close(m6Reading(25.2,10).initial,20);
  for(const args of [[-1,1],[37.9,1],[NaN,1],[1,0],[1,Infinity]])assert.equal(m6Reading(...args),null);
});
test('grading rejects common unit and dilution reversals while accepting scientific notation',()=>{
  const unit=moduleSixQuestions.find(q=>q.id==='m6-u1'),dilution=moduleSixQuestions.find(q=>q.id==='m6-d1');assert.ok(isCorrect(unit,'1,89 × 10⁻²'));assert.equal(isCorrect(unit,'18,9'),false);assert.equal(isCorrect(unit,'0,0000189'),false);assert.ok(isCorrect(dilution,'7,5'));assert.equal(isCorrect(dilution,'0,3'),false);
  for(let i=0;i<40;i++){const ids=makeExam(moduleSixQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleSixSkills))assert.equal(ids.filter(id=>moduleSixQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('six independent stores restore course progress and an interrupted test without changing older modules',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions,moduleSixQuestions];const keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1','declic-lumiere-etalonnage-v1','declic-conductivite-ions-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i%4,completed:[i%4],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'0,0189'}]}};});const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)])),store={getItem:k=>data.get(k)};
  for(let i=0;i<6;i++){const restored=readState(store,banks[i],keys[i]);assert.deepEqual(restored.completed,originals[i].completed);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
