import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleEightLessons,moduleEightQuestions,moduleEightSkills} from '../module-eight-content.js';
import {m8Label,m8Titration,m8Equivalence} from '../module-eight-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {moduleFiveQuestions} from '../module-five-content.js';
import {moduleSixQuestions} from '../module-six-content.js';
import {moduleSevenQuestions} from '../module-seven-content.js';
import {isCorrect,emptyState,readState,makeExam} from '../core.js';
const m8Close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≈ ${b}`);
test('module 8 has four lessons and 24 valid questions balanced across four skills',()=>{
  assert.equal(moduleEightLessons.length,4);assert.equal(new Set(moduleEightQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleEightSkills))assert.equal(moduleEightQuestions.filter(q=>q.skill===skill).length,6);
  for(const lesson of moduleEightLessons)assert.ok(moduleEightQuestions.some(q=>q.id===lesson.question));
  for(const q of moduleEightQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(isCorrect(q,q.correct));assert.equal(q.feedback.length,q.options.length);}else{assert.ok(isCorrect(q,String(q.value)));assert.ok(q.unit);assert.ok(q.answers[0]);}}
});
test('mass and percentage labels recover the same concentration with coherent solution units',()=>{
  const mass=m8Label('mass',{mass:6,volume:100,molarMass:60}),percent=m8Label('percent',{percent:6,density:1,molarMass:60});m8Close(mass.n,.1);m8Close(mass.volumeL,.1);m8Close(mass.c,1);m8Close(percent.c,mass.c);m8Close(percent.mass,60);m8Close(percent.solutionMass,1000);
  m8Close(m8Label('mass',{mass:12,volume:100,molarMass:60}).c,2);m8Close(m8Label('mass',{mass:6,volume:200,molarMass:60}).c,.5);m8Close(m8Label('percent',{percent:6,density:1.2,molarMass:60}).c,1.2);assert.equal(m8Label('mass',{mass:0}).c,0);
});
test('invalid labels and unphysical titration-calculation inputs are rejected',()=>{
  for(const [mode,args] of [['mass',{mass:-1}],['mass',{volume:0}],['mass',{molarMass:0}],['percent',{percent:101}],['percent',{density:0}],['percent',{percent:NaN}],['other',{}]])assert.equal(m8Label(mode,args),null);
  for(const v of [-1,25,NaN,Infinity])assert.equal(m8Titration(v),null);
  for(const args of [[0,10,12],[.1,0,12],[.1,10,-1],[.1,10,12,0,1],[.1,10,12,1,.5],[Infinity,10,12]])assert.equal(m8Equivalence(...args),null);
});
test('the equivalence volume changes the excess reactant while total additions stay distinct',()=>{
  const before=m8Titration(8),at=m8Titration(12),after=m8Titration(16);assert.equal(before.stage,'before');m8Close(before.acid,.4);m8Close(before.base,0);m8Close(before.added,.8);assert.equal(at.stage,'at');assert.equal(at.totalVolume,22);assert.equal(at.acid,0);assert.equal(at.base,0);m8Close(at.water,2.4);assert.equal(after.stage,'after');m8Close(after.base,.4);m8Close(after.acid,0);m8Close(after.added,1.6);assert.ok(after.added>after.base);
});
test('titration conserves charge and reactant balances and keeps spectator ions at equivalence',()=>{
  for(let v=0;v<=24;v+=.1){const m=m8Titration(v);m8Close(m.acid+m.reacted,m.initial);m8Close(m.base+m.reacted,m.added);m8Close(m.acid+m.sodium,m.base+m.chloride);m8Close(m.water,2*m.reacted);m8Close(m.totalVolume,10+v);assert.ok(m.acid>=0&&m.base>=0);assert.ok(m.acid===0||m.base===0);}
  const m=m8Titration(12);assert.ok(m.sodium>0&&m.chloride>0);m8Close(m.sodium,m.chloride);
});
test('equivalence calculations apply coefficients in the correct direction and convert mL to L',()=>{
  const one=m8Equivalence(.1,10,12),twoB=m8Equivalence(.1,10,12,1,2),twoA=m8Equivalence(.1,10,12,2,1);m8Close(one.nb,.0012);m8Close(one.ca,.12);m8Close(twoB.ca,.06);m8Close(twoA.ca,.24);
  for(const a of [1,2,3])for(const b of [1,2,3])for(const va of [5,10,20]){const m=m8Equivalence(.1,va,12,a,b);m8Close(m.na/a,m.nb/b);m8Close(m.ca*va/1000,m.na);}
});
test('numeric grading catches percent, mL and stoichiometric-ratio errors and test selection stays balanced',()=>{
  const first=moduleEightQuestions.find(q=>q.id==='m8-e1'),coeff=moduleEightQuestions.find(q=>q.id==='m8-p4'),amount=moduleEightQuestions.find(q=>q.id==='m8-p6');assert.ok(isCorrect(first,'1,00'));assert.equal(isCorrect(first,'0,001'),false);assert.ok(isCorrect(coeff,'0,0600'));assert.equal(isCorrect(coeff,'0,12'),false);assert.equal(isCorrect(coeff,'0,24'),false);assert.ok(isCorrect(amount,'1,20 × 10⁻³'));assert.equal(isCorrect(amount,'1,20'),false);
  for(let i=0;i<30;i++){const ids=makeExam(moduleEightQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleEightSkills))assert.equal(ids.filter(id=>moduleEightQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('eight module stores restore independent lessons and interrupted tests without changing previous progress',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions,moduleSixQuestions,moduleSevenQuestions,moduleEightQuestions],keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1','declic-lumiere-etalonnage-v1','declic-conductivite-ions-v1','declic-gaz-spectres-v1','declic-titrage-equivalence-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i%4,completed:[i%4],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'0,120'}]}};});const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)])),store={getItem:k=>data.get(k)};
  assert.equal(new Set(banks.flatMap(bank=>bank.map(q=>q.id))).size,banks.reduce((n,bank)=>n+bank.length,0));
  for(let i=0;i<8;i++){const restored=readState(store,banks[i],keys[i]);assert.deepEqual(restored.completed,originals[i].completed);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
