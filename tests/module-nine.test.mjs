import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleNineLessons,moduleNineQuestions,moduleNineSkills} from '../module-nine-content.js';
import {m9PH,m9Tangents,m9Ions,m9Result,m9Report} from '../module-nine-lab.js';
import {questions} from '../content.js';
import {moduleTwoQuestions} from '../module-two-content.js';
import {moduleThreeQuestions} from '../module-three-content.js';
import {moduleFourQuestions} from '../module-four-content.js';
import {moduleFiveQuestions} from '../module-five-content.js';
import {moduleSixQuestions} from '../module-six-content.js';
import {moduleSevenQuestions} from '../module-seven-content.js';
import {moduleEightQuestions} from '../module-eight-content.js';
import {isCorrect,emptyState,readState,makeExam} from '../core.js';
import {formatFractionHTML} from '../math-format.js';
const m9Close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≈ ${b}`);
test('derivative and uncertainty quotients keep the established stacked fraction notation',()=>{
  for(const expression of ['dpH/dV','u(C<sub>A</sub>)/C<sub>A</sub>','u(V<sub>E</sub>)/V<sub>E</sub>']){const html=formatFractionHTML(expression);assert.ok(html.includes('class="math-frac"'));assert.ok(!html.replace(/<[^>]+>/g,'').includes('/'));}
});
test('module 9 covers four skills with six questions each and every lesson has a valid exercise',()=>{
  assert.equal(moduleNineLessons.length,4);assert.equal(new Set(moduleNineQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleNineSkills))assert.equal(moduleNineQuestions.filter(q=>q.skill===skill).length,6);
  for(const lesson of moduleNineLessons)assert.ok(moduleNineQuestions.some(q=>q.id===lesson.question));
  for(const q of moduleNineQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(isCorrect(q,q.correct));assert.equal(q.feedback.length,q.options.length);}else{assert.ok(isCorrect(q,String(q.value)));assert.ok(q.unit);assert.ok(q.answers[0]);}}
});
test('schematic pH grows, is symmetric and has its derivative maximum at equivalence',()=>{
  m9Close(m9PH(16).ph,7);let previous=-Infinity;
  for(let v=0;v<=32;v+=.125){const m=m9PH(v);assert.ok(m.ph>previous);previous=m.ph;assert.ok(m.ph>=2&&m.ph<=12);assert.ok(m.derivative<=m9PH(16).derivative);m9Close(m.ph+m9PH(32-v).ph,14);if(v>0&&v<32){const h=.0001;assert.ok(Math.abs((m9PH(v+h).ph-m9PH(v-h).ph)/(2*h)-m.derivative)<1e-8);}}
  for(const bad of [-1,33,NaN,Infinity])assert.equal(m9PH(bad),null);
});
test('parallel construction uses true tangent slopes and a middle line through the inflection',()=>{
  const t=m9Tangents();m9Close(t.slope,m9PH(t.before.x).derivative);m9Close(t.slope,m9PH(t.after.x).derivative);
  const b=p=>p.y-t.slope*p.x;m9Close(b(t.middle),(b(t.before)+b(t.after))/2);m9Close(t.middle.y,m9PH(t.middle.x).ph);
});
test('ionic balances conserve charge, include dilution, and retain spectators at equivalence',()=>{
  for(let v=0;v<=32;v+=.2){const m=m9Ions(v);m9Close(m.acid+m.sodium,m.base+m.chloride);assert.ok(m.acid>=0&&m.base>=0);assert.ok(m.acid<1e-9||m.base<1e-9);m9Close(m.sigma,Object.values(m.contributions).reduce((a,b)=>a+b,0));m9Close(m.corrected,m.sigma*(20+v)/20);m9Close(m.concentrations.chloride,1600/(20+v));}
  const at=m9Ions(16);assert.equal(at.stage,'at');assert.equal(at.acid,0);assert.equal(at.base,0);assert.ok(at.sodium>0&&at.chloride>0&&at.sigma>0);m9Close(at.corrected,1.008);
  for(const bad of [-1,33,NaN,Infinity])assert.equal(m9Ions(bad),null);
});
test('corrected conductivity has two linear sections meeting at 16 mL; measured signal differs',()=>{
  const f=v=>m9Ions(v).corrected;const before=(f(16)-f(0))/16,after=(f(32)-f(16))/16;assert.ok(before<0);assert.ok(after>0);
  for(let v=0;v<=32;v+=.25){m9Close(f(v),v<=16?f(0)+before*v:f(16)+after*(v-16));if(v>0)assert.ok(m9Ions(v).sigma<f(v));}
  m9Close((f(0)-(f(16)-after*16))/(after-before),16);
});
test('concentration, uncertainty and dilution propagate coherently with matching decimal places',()=>{
  const m=m9Result(.1,10,12,.2,5);m9Close(m.ca,.12);m9Close(m.uca,.002);m9Close(m.initial,.6);m9Close(m.uinitial,.01);m9Close(m.uca/m.ca,m.relative);m9Close(m.uinitial/m.initial,m.relative);
  assert.equal(m9Report(m.ca,m.uca),'(0,1200 ± 0,0020) mol·L⁻¹');assert.equal(m9Report(m.initial,m.uinitial),'(0,600 ± 0,010) mol·L⁻¹');assert.equal(m9Report(.036,.0006),'(0,03600 ± 0,00060) mol·L⁻¹');
  assert.equal(m9Report(1.234,.0999),'(1,23 ± 0,10) mol·L⁻¹');assert.ok(m9Report(1.23e-10,2e-12).includes('10<sup>-10</sup>'));
  for(const args of [[0,10,12,.2,5],[.1,0,12,.2,5],[.1,10,0,.2,5],[.1,10,12,0,5],[.1,10,12,12,5],[.1,10,12,.2,.5],[Infinity,10,12,.2,5],[.1,10,12,.2,Infinity]])assert.equal(m9Result(...args),null);
  assert.equal(m9Report(1,0),null);
});
test('grading accepts scientific results and rejects inverse dilution and relative/absolute uncertainty confusion',()=>{
  const q=id=>moduleNineQuestions.find(q=>q.id===id);assert.ok(isCorrect(q('m9-c3'),'2 × 10⁻³'));assert.equal(isCorrect(q('m9-c3'),'0,0167'),false);assert.equal(isCorrect(q('m9-c2'),'0,024'),false);assert.equal(isCorrect(q('m9-r1'),'3'),false);
  for(let i=0;i<30;i++){const ids=makeExam(moduleNineQuestions);assert.equal(new Set(ids).size,8);for(const skill of Object.keys(moduleNineSkills))assert.equal(ids.filter(id=>q(id).skill===skill).length,2);}
});
test('nine separate stores preserve previous progress and interrupted exams without any migration',()=>{
  const banks=[questions,moduleTwoQuestions,moduleThreeQuestions,moduleFourQuestions,moduleFiveQuestions,moduleSixQuestions,moduleSevenQuestions,moduleEightQuestions,moduleNineQuestions],keys=['declic-acide-base-v1','declic-reactions-amphoteres-v1','declic-lewis-protons-v1','declic-ph-concentration-v1','declic-lumiere-etalonnage-v1','declic-conductivite-ions-v1','declic-gaz-spectres-v1','declic-titrage-equivalence-v1','declic-courbes-precision-v1'];
  const originals=banks.map((bank,i)=>{const ids=makeExam(bank);return {...emptyState(),lesson:i%4,completed:[i%4],exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:'0,120'}]}};});const data=new Map(originals.map((s,i)=>[keys[i],JSON.stringify(s)])),storage={getItem:k=>data.get(k)};
  assert.equal(new Set(banks.flatMap(bank=>bank.map(q=>q.id))).size,banks.reduce((n,bank)=>n+bank.length,0));
  for(let i=0;i<9;i++){const restored=readState(storage,banks[i],keys[i]);assert.deepEqual(restored.completed,originals[i].completed);assert.deepEqual(restored.exam,originals[i].exam);assert.equal(data.get(keys[i]),JSON.stringify(originals[i]));}
});
