import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleFourLessons,moduleFourQuestions,moduleFourSkills} from '../module-four-content.js';
import {m4Concentration,m4PH,m4Nature,m4Comparison,m4Scientific} from '../module-four-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {parseNumericAnswer,isCorrect,emptyState,readState,makeExam} from '../core.js';
test('module 4 has four valid lessons and six questions for each skill',()=>{
  assert.equal(moduleFourLessons.length,4);assert.equal(new Set(moduleFourQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleFourSkills))assert.equal(moduleFourQuestions.filter(q=>q.skill===skill).length,6);
  for(const l of moduleFourLessons)assert.ok(moduleFourQuestions.some(q=>q.id===l.question));
  for(const q of moduleFourQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(q.feedback.length,q.options.length);}else{assert.equal(q.type,'number');assert.ok(Number.isFinite(q.value));assert.ok(isCorrect(q,String(q.value)));assert.ok(q.answers[0]);assert.ok(q.unit);}}
});
test('numeric answers accept French decimals and scientific notation without evaluating expressions',()=>{
  for(const text of ['0,0001','1e-4','1E-4','10^-4','10⁻⁴','1 × 10^(-4)','1·10⁻⁴'])assert.equal(parseNumericAnswer(text),1e-4);
  assert.equal(parseNumericAnswer('2,70'),2.7);assert.equal(parseNumericAnswer('3,16 × 10⁻³'),.00316);
  for(const text of ['',null,'1e-4 mol/L','0x10','2+2','Infinity','alert(1)','3/4'])assert.ok(!Number.isFinite(parseNumericAnswer(text)));
});
test('numeric grading accepts rounding but rejects a wrong exponent, wrong sign and incorrect pH',()=>{
  const concentration=moduleFourQuestions.find(q=>q.id==='m4-c1');assert.ok(isCorrect(concentration,'10⁻⁴'));for(const wrong of ['-0,0001','1e4','1e-3','0','0,000101'])assert.equal(isCorrect(concentration,wrong),false);
  assert.ok(isCorrect(moduleFourQuestions.find(q=>q.id==='m4-c3'),'3,16e-3'));
  const ph=moduleFourQuestions.find(q=>q.id==='m4-p1');assert.ok(isCorrect(ph,'2,70'));for(const wrong of ['-2,70','2,69','3','2,71'])assert.equal(isCorrect(ph,wrong),false);
});
test('pH and concentration calculations are inverse and neutral pH is 7 at 25 degrees',()=>{
  for(let ph=2;ph<=12;ph+=.1)assert.ok(Math.abs(m4PH(m4Concentration(ph))-ph)<1e-12);
  assert.equal(m4Nature(3),'acide');assert.equal(m4Nature(7),'neutre');assert.equal(m4Nature(9),'basique');assert.ok(Number.isNaN(m4PH(0)));assert.ok(Number.isNaN(m4PH(-1)));assert.ok(Number.isNaN(m4PH(Infinity)));assert.ok(m4Concentration(7)>0);
});
test('equal-volume ion drawings preserve concentration ratios and dilution divides by ten',()=>{
  for(const a of [3,4,5])for(const b of [3,4,5]){const m=m4Comparison(a,b);assert.equal(m.aDots/m.bDots,m.ratio);assert.ok(Number.isInteger(m.aDots)&&m.aDots>=1&&m.aDots<=100);assert.ok(Number.isInteger(m.bDots)&&m.bDots>=1&&m.bDots<=100);assert.ok(Math.abs(m.ratio-m4Concentration(a)/m4Concentration(b))<1e-12);}
  assert.equal(m4Comparison(3,5).ratio,100);assert.equal(m4Comparison(4,5).ratio,10);assert.equal(m4Comparison(5,5).ratio,1);
});
test('scientific display keeps concentrations positive and round-trips to the displayed precision',()=>{
  for(const n of [1e-12,1e-7,3.16e-3,9.999e-3,1e-2])assert.ok(Math.abs(parseNumericAnswer(m4Scientific(n))/n-1)<.0051);
  assert.equal(m4Scientific(0),'—');assert.equal(m4Scientific(NaN),'—');
});
test('module 4 tests contain eight distinct questions with two per skill',()=>{
  for(let i=0;i<40;i++){const ids=makeExam(moduleFourQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleFourSkills))assert.equal(ids.filter(id=>moduleFourQuestions.find(q=>q.id===id).skill===skill).length,2);}
});
test('all four modules retain independent progress, including numeric answers and pending tests',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions];const keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i,completed:[i],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'2,70'}]}};});
  const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)]));const storage={getItem:k=>data.get(k)};
  for(let i=0;i<4;i++){const restored=readState(storage,banks[i],keys[i]);assert.deepEqual(restored.completed,[i]);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
