import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chapterBacCases} from '../chapter-bac-content.js';
import {chapterEmpty,chapterRead,chapterRecord,chapterBacScore} from '../chapter-core.js';
import {isCorrect} from '../core.js';
const bacClose=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≈ ${b}`);
test('two original bac subjects each have ten questions, 20 indicative points and explicit written rubrics',()=>{
  assert.equal(chapterBacCases.length,2);const ids=new Set();for(const c of chapterBacCases){assert.ok(c.bac);assert.equal(c.questions.length,10);assert.equal(c.questions.reduce((n,q)=>n+q.points,0),20);assert.ok(c.documents.length>=2);assert.equal(c.questions.filter(q=>q.type==='written').length,4);for(const q of c.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.equal(q.hints.length,3);if(q.type==='written')assert.equal(q.rubric.length,2);else assert.ok(isCorrect(q,q.answers[0].replace(q.unit,'').trim()),q.id);}}
});
test('detergent subject joins dilution, stoichiometry, mass concentration, uncertainty and the supplied control criterion',()=>{
  const q=id=>chapterBacCases[0].questions.find(q=>q.id===id);bacClose(q('bac-a5').value,.085*14.7/12);bacClose(q('bac-a6').value,25*q('bac-a5').value);bacClose(q('bac-a7').value,46*q('bac-a6').value);bacClose(q('bac-a8').value,25*.085*.10/12);bacClose(q('bac-a9').value,Math.abs(q('bac-a7').value-121)/121*100);assert.ok(q('bac-a9').value<2);assert.equal(q('bac-a3').graph,'weak-ph');assert.ok(isCorrect(q('bac-a8'),'0,018'));assert.equal(isCorrect(q('bac-a8'),'0,00070833'),false);
});
test('analysis subject applies SI prefixes, optical calibration range and absolute gas temperature coherently',()=>{
  const q=id=>chapterBacCases[1].questions.find(q=>q.id===id);bacClose(q('bac-b2').value,.561/.165);bacClose(q('bac-b3').value,40*q('bac-b2').value);bacClose(q('bac-b5').value,46.62/1000);bacClose(q('bac-b6').value,q('bac-b5').value/.0126);bacClose(q('bac-b7').value,21.4+273.15);bacClose(q('bac-b8').value,98500*.000286/(8.314*q('bac-b7').value));assert.ok(isCorrect(q('bac-b8'),'1,15 × 10⁻²'));
});
test('free writing is never graded automatically and saved self-assessment restores independently',()=>{
  const c=chapterBacCases[0],q=c.questions[0],record=chapterRecord(q,'Une réaction conserve les atomes et les charges.');assert.equal(record.correct,false);assert.equal(record.selfPoints,null);record.selfPoints=1;
  const raw={...chapterEmpty(),cases:{[c.id]:{records:[record],draft:null,hints:0,showLast:true}}};let saved=chapterRead({getItem:()=>JSON.stringify(raw)});assert.equal(saved.cases[c.id].records[0].selfPoints,1);assert.equal(saved.cases[c.id].records[0].correct,false);assert.equal(saved.cases[c.id].showLast,true);
  raw.cases[c.id].records[0].selfPoints=20;saved=chapterRead({getItem:()=>JSON.stringify(raw)});assert.equal(saved.cases[c.id].records[0].selfPoints,null);
});
test('indicative scores distinguish verified points, self-assessed points and assistance',()=>{
  const c=chapterBacCases[0],records=c.questions.map(q=>{const r=chapterRecord(q,q.type==='written'?'Justification rédigée.':String(q.value));if(q.type==='written'){r.selfPoints=2;r.correct=true;}return r;});assert.deepEqual(chapterBacScore(c,records),{auto:12,autoMax:12,written:8,writtenMax:8,unassessed:0,total:20});records[2].assisted=true;assert.equal(chapterBacScore(c,records).auto,10);records[0].selfPoints=null;assert.equal(chapterBacScore(c,records).unassessed,1);assert.equal(chapterBacScore(c,records).written,6);
});
