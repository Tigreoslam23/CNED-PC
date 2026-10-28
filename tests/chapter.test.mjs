import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chapterDiagnostic,chapterCases} from '../chapter-content.js';
import {CHAPTER_STORAGE_KEY,chapterRead,chapterEmpty,chapterRecord,chapterScore,chapterModuleResults,chapterTargets,chapterFeedback} from '../chapter-core.js';
import {isCorrect,parseNumericAnswer,normalizeFormula} from '../core.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {moduleFiveQuestions} from '../module-five-content.js';
import {moduleSixQuestions} from '../module-six-content.js';
import {moduleSevenQuestions} from '../module-seven-content.js';
import {moduleEightQuestions} from '../module-eight-content.js';
import {moduleNineQuestions} from '../module-nine-content.js';
const cpBank=[...chapterDiagnostic,...chapterCases.flatMap(c=>c.questions)];
const cpAnswer=q=>q.type==='choice'?q.correct:q.type==='number'?q.answers[0].replace(q.unit,'').trim():q.answers[0];
const cpClose=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≈ ${b}`);
test('the fixed diagnostic has 18 original questions, two per module, in a stable order',async()=>{
  assert.equal(chapterDiagnostic.length,18);assert.deepEqual(chapterDiagnostic.map(q=>q.module),Array.from({length:9},(_,i)=>[String(i+1),String(i+1)]).flat());
  const original=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions,moduleSixQuestions,moduleSevenQuestions,moduleEightQuestions,moduleNineQuestions].flat();
  for(const q of cpBank){assert.ok(!original.some(previous=>previous.id===q.id||previous.prompt===q.prompt));assert.ok(isCorrect(q,cpAnswer(q)),q.id);assert.ok(q.lesson>=0&&q.lesson<4);}
  assert.equal(new Set(cpBank.map(q=>q.id)).size,35);
  assert.ok(!(await readFile(new URL('../chapter-content.js',import.meta.url),'utf8')).includes('Math.random'));
  assert.deepEqual(chapterDiagnostic.filter(q=>q.type==='number').map(q=>q.id),['cp-d07','cp-d08','cp-d09','cp-d10','cp-d11','cp-d12','cp-d13','cp-d15','cp-d16','cp-d17','cp-d18']);
});
test('new diagnostic calculations use their own datasets, coherent units and rounding',()=>{
  const q=id=>chapterDiagnostic.find(q=>q.id===id);cpClose(q('cp-d07').value,10**-3.75);cpClose(q('cp-d08').value,-Math.log10(6.8e-5));cpClose(q('cp-d09').value,175*.0016);cpClose(q('cp-d10').value,64/8*.85);cpClose(q('cp-d11').value,.0126*4.25);cpClose(q('cp-d12').value,64.7/1000);cpClose(q('cp-d13').value,97000*.000135/(8.314*(18.6+273.15)));cpClose(q('cp-d15').value,(1.89/90)/.15);cpClose(q('cp-d16').value,.075*13.2/15);cpClose(q('cp-d18').value,.066*.15/13.2);
  assert.ok(isCorrect(q('cp-d07'),'1,78 × 10⁻⁴'));assert.equal(isCorrect(q('cp-d10'),'0,10625'),false);assert.equal(isCorrect(q('cp-d15'),'0,00014'),false);
});
test('formula answers are not supplied by an earlier diagnostic statement or by input examples',async()=>{
  const ui=await readFile(new URL('../chapter-bilan.js',import.meta.url),'utf8');
  for(let i=0;i<chapterDiagnostic.length;i++){const q=chapterDiagnostic[i];if(q.type!=='formula')continue;for(const expected of q.answers){assert.ok(!ui.includes(expected));for(const previous of chapterDiagnostic.slice(0,i))assert.ok(!normalizeFormula(previous.prompt).includes(normalizeFormula(expected)),q.id);}}
});
test('three synthesis cases provide distinct questions with three progressive hints and coherent end results',()=>{
  assert.equal(chapterCases.length,3);for(const c of chapterCases){assert.ok(c.dossier);assert.ok(c.questions.length>=5);for(const q of c.questions)assert.equal(q.hints.length,3);}
  const q=id=>cpBank.find(q=>q.id===id);cpClose(q('cp-b2').value,.455/.14);cpClose(q('cp-b3').value,6*3.25);cpClose(q('cp-b6').value,103000*.000168/(8.314*305.15));cpClose(q('cp-c3').value,.062*19.4/12.5);cpClose(q('cp-c4').value,7*q('cp-c3').value);cpClose(q('cp-c5').value,q('cp-c4').value*.12/19.4);
  assert.ok(isCorrect(q('cp-c3'),'0,0962'));assert.ok(isCorrect(q('cp-c4'),'0,674'));assert.ok(isCorrect(q('cp-c5'),'4,17 × 10⁻³'));assert.equal(isCorrect(q('cp-c5'),'0,0005952'),false);
});
test('fresh, malformed and blocked storage recover without touching any module key',()=>{
  assert.deepEqual(chapterRead(null),chapterEmpty());assert.deepEqual(chapterRead({getItem:()=>'{bad'}),chapterEmpty());assert.deepEqual(chapterRead({getItem:()=>{throw Error();}}),chapterEmpty());
  const keys=[];chapterRead({getItem:key=>{keys.push(key);return null;}});assert.deepEqual(keys,[CHAPTER_STORAGE_KEY]);
});
test('partial diagnostic, draft and case hint progress survive reload and stored grades are recomputed',()=>{
  const raw=chapterEmpty();raw.diagnostic={records:[{...chapterRecord(chapterDiagnostic[0],chapterDiagnostic[0].correct),correct:false}],draft:'C6H5COO-'};raw.cases.acide={records:[],draft:'HCOO-',hints:2,showLast:false};
  const restored=chapterRead({getItem:()=>JSON.stringify(raw)});assert.equal(restored.diagnostic.records.length,1);assert.equal(restored.diagnostic.records[0].correct,true);assert.equal(restored.diagnostic.draft,'C6H5COO-');assert.equal(restored.cases.acide.hints,2);assert.equal(restored.cases.acide.draft,'HCOO-');
  raw.diagnostic.records[0].id='foreign-id';assert.equal(chapterRead({getItem:()=>JSON.stringify(raw)}).diagnostic,null);
});
test('reports require all 18 ordered records; wrong answers and skipped questions create targeted revision links',()=>{
  const records=chapterDiagnostic.map(q=>chapterRecord(q,cpAnswer(q)));records[9]=chapterRecord(chapterDiagnostic[9],'0,10625');records[11]=chapterRecord(chapterDiagnostic[11],null);
  const report={records,date:'2026-10-28'};assert.equal(chapterScore(records),16);assert.equal(chapterModuleResults(report)[4].correct,1);assert.equal(chapterModuleResults(report)[5].correct,1);assert.ok(chapterTargets(report).some(t=>t.module==='5'&&t.lesson===3&&t.message.includes('envers')));assert.ok(chapterFeedback(chapterDiagnostic[11],null).includes('non répondue'));
  const raw={...chapterEmpty(),reports:[report]};assert.equal(chapterRead({getItem:()=>JSON.stringify(raw)}).reports.length,1);raw.reports[0].records.pop();assert.equal(chapterRead({getItem:()=>JSON.stringify(raw)}).reports.length,0);
});
test('assisted synthesis success is separate from independent success and completed cases restore',()=>{
  const c=chapterCases[0],records=c.questions.map(q=>chapterRecord(q,cpAnswer(q)));records[0].assisted=true;assert.equal(chapterScore(records),4);
  const raw={...chapterEmpty(),cases:{acide:{records,draft:null,hints:0,showLast:false}}};const restored=chapterRead({getItem:()=>JSON.stringify(raw)});assert.equal(restored.cases.acide.records.length,5);assert.equal(restored.cases.acide.records[0].assisted,true);assert.equal(restored.cases.acide.showLast,false);
});
test('numeric scientific answer transfers stay valid in all chapter calculation questions',()=>{
  for(const q of cpBank.filter(q=>q.type==='number')){const text=q.value.toExponential(8).replace('e',' × 10^');assert.ok(Number.isFinite(parseNumericAnswer(text)));assert.ok(isCorrect(q,text),q.id);}
});
