import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleSevenLessons,moduleSevenQuestions,moduleSevenSkills} from '../module-seven-content.js';
import {m7Piston,m7Gas,m7Particle,m7UV,m7IR,m7Candidate} from '../module-seven-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {moduleFiveQuestions} from '../module-five-content.js';
import {moduleSixQuestions} from '../module-six-content.js';
import {isCorrect,emptyState,readState,makeExam} from '../core.js';
const m7Close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≈ ${b}`);
test('module 7 links four lessons to 24 gradable questions across four skills',()=>{
  assert.equal(moduleSevenLessons.length,4);assert.equal(new Set(moduleSevenQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleSevenSkills))assert.equal(moduleSevenQuestions.filter(q=>q.skill===skill).length,6);
  for(const lesson of moduleSevenLessons)assert.ok(moduleSevenQuestions.some(q=>q.id===lesson.question));
  for(const q of moduleSevenQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(isCorrect(q,q.correct));assert.equal(q.feedback.length,q.options.length);}else{assert.ok(isCorrect(q,String(q.value)));assert.ok(q.answers[0]);assert.ok(q.unit);}}
});
test('isothermal piston preserves PV and doubles pressure when volume is halved',()=>{
  for(let v=50;v<=200;v+=5){const m=m7Piston(v);m7Close(m.pressure*v*1e-6,10);assert.ok(m.right>=200&&m.right<=500);}
  assert.equal(m7Piston(50).pressure,200000);assert.equal(m7Piston(200).pressure,50000);
  for(const v of [0,49,201,NaN,Infinity])assert.equal(m7Piston(v),null);
});
test('CO2 models stay inside the chamber at every supported piston volume and keep moving',()=>{
  for(const v of [50,100,200])for(let i=0;i<16;i++)for(let t=0;t<10;t+=.13){const p=m7Particle(i,t,v);assert.ok(p.x-14>=100&&p.x+14<=m7Piston(v).right);assert.ok(p.y>100&&p.y<260);}
  assert.notDeepEqual(m7Particle(1,0,100),m7Particle(1,1,100));assert.equal(m7Particle(0,0,1),null);
});
test('ideal-gas calculator converts all offered units and recovers n consistently',()=>{
  const a=m7Gas(100000,'Pa',100,'mL',25,'C'),b=m7Gas(100,'kPa',.1,'L',298.15,'K');for(const key of Object.keys(a))m7Close(a[key],b[key]);m7Close(a.pv,10);m7Close(a.t,298.15);m7Close(a.rt,2478.8191);m7Close(a.n,.004034,1e-6);m7Close(a.n*8.314*a.t,a.p*a.v);
  m7Close(m7Gas(200000,'Pa',100,'mL',25,'C').n,2*a.n);
  for(const args of [[0,'Pa',100,'mL',25,'C'],[1,'bar',1,'L',25,'C'],[1,'Pa',0,'L',25,'C'],[1,'Pa',1,'L',0,'K'],[1,'Pa',1,'L',-273.15,'C'],[NaN,'Pa',1,'L',25,'C']])assert.equal(m7Gas(...args),null);
});
test('UV-visible model peaks at 450 nm with nonnegative absorbance',()=>{
  const samples=Array.from({length:301},(_,i)=>({lambda:400+i,a:m7UV(400+i)}));assert.equal(samples.reduce((a,b)=>a.a>b.a?a:b).lambda,450);m7Close(m7UV(450),1.2);assert.ok(m7UV(650)<m7UV(500));for(const s of samples)assert.ok(s.a>=0&&s.a<=1.2);
  for(const value of [399,701,NaN])assert.ok(Number.isNaN(m7UV(value)));
});
test('IR profiles distinguish broad OH and narrow carbonyl absorptions within physical transmittance bounds',()=>{
  for(const profile of [1,2,3])for(let w=500;w<=4000;w+=5){const t=m7IR(w,profile);assert.ok(t>0&&t<=1);}
  assert.ok(m7IR(3300,1)<.4);assert.ok(m7IR(1710,1)<.2);assert.ok(m7IR(3300,2)>.9);assert.ok(m7IR(1710,2)<.2);assert.ok(m7IR(3300,3)<.4);assert.ok(m7IR(1710,3)>.9);
  assert.ok(m7IR(3200,1)<.6);assert.ok(m7IR(1810,1)>.9);assert.ok(m7Candidate(1,'X'));assert.ok(m7Candidate(2,'Y'));assert.ok(m7Candidate(3,'Z'));assert.equal(m7Candidate(2,'X'),false);assert.ok(Number.isNaN(m7IR(4001)));assert.ok(Number.isNaN(m7IR(1700,4)));
});
test('grading accepts rounded scientific answers but rejects litre and Celsius errors; tests remain balanced',()=>{
  const q=moduleSevenQuestions.find(q=>q.id==='m7-g1');assert.ok(isCorrect(q,'4,03 × 10⁻³'));assert.ok(isCorrect(q,String(m7Gas(100000,'Pa',100,'mL',25,'C').n)));assert.equal(isCorrect(q,'4,03'),false);assert.equal(isCorrect(q,'0,0481'),false);assert.equal(isCorrect(q,'4e-3'),false);
  for(let i=0;i<30;i++){const ids=makeExam(moduleSevenQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleSevenSkills))assert.equal(ids.filter(id=>moduleSevenQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('seven module stores preserve independent progress and interrupted tests',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions,moduleSixQuestions,moduleSevenQuestions],keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1','declic-lumiere-etalonnage-v1','declic-conductivite-ions-v1','declic-gaz-spectres-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i%4,completed:[i%4],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'4,03e-3'}]}};});const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)])),store={getItem:k=>data.get(k)};
  assert.equal(new Set(banks.flatMap(bank=>bank.map(q=>q.id))).size,banks.reduce((n,bank)=>n+bank.length,0));
  for(let i=0;i<7;i++){const restored=readState(store,banks[i],keys[i]);assert.deepEqual(restored.completed,originals[i].completed);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
