import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moduleTwoLessons,moduleTwoQuestions,moduleTwoSkills} from '../module-two-content.js';
import {questions} from '../content.js';
import {STORAGE_KEY,emptyState,readState,makeExam,summarize,isCorrect} from '../core.js';
import {vinegarFrame,vinegarInventory,amphotericModel} from '../module-two-reaction.js';

test('module 2 has four lessons and six valid questions for each of its skills',()=>{
  assert.equal(moduleTwoLessons.length,4);assert.equal(new Set(moduleTwoQuestions.map(q=>q.id)).size,24);
  for(const skill of Object.keys(moduleTwoSkills))assert.equal(moduleTwoQuestions.filter(q=>q.skill===skill).length,6);
  for(const l of moduleTwoLessons)assert.ok(moduleTwoQuestions.some(q=>q.id===l.question));
  for(const q of moduleTwoQuestions){assert.equal(q.hints.length,2);if(q.type==='choice'){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(q.feedback.length,q.options.length);}else assert.ok(q.answers.length);}
});
test('the test generator uses the selected module skills and never imports module 1 questions',()=>{
  for(let i=0;i<30;i++){const exam=makeExam(moduleTwoQuestions);assert.equal(new Set(exam).size,8);for(const skill of Object.keys(moduleTwoSkills))assert.equal(exam.filter(id=>moduleTwoQuestions.find(q=>q.id===id).skill===skill).length,2);}
  assert.deepEqual(Object.keys(summarize([],moduleTwoQuestions)),Object.keys(moduleTwoSkills));
});
test('module 1 progress survives loading module 2 and a pending test stays separate',()=>{
  const ids=makeExam(questions);const original={...emptyState(),completed:[0,1],lesson:2,exam:{ids,index:1,answers:[{id:ids[0],correct:true,assisted:false,answer:0}]}};
  const data=new Map([[STORAGE_KEY,JSON.stringify(original)]]);const store={getItem:key=>data.get(key)||null};
  assert.deepEqual(readState(store,moduleTwoQuestions,'declic-reactions-amphoteres-v1'),emptyState());
  const restored=readState(store,questions);assert.deepEqual(restored.completed,[0,1]);assert.deepEqual(restored.exam,original.exam);assert.equal(data.get(STORAGE_KEY),JSON.stringify(original));
});
test('module 2 formula grading handles carbonic acid, carbon dioxide and the carbonate charge',()=>{
  assert.ok(isCorrect(moduleTwoQuestions.find(q=>q.id==='m2-e2'),'H₂CO₃'));
  assert.ok(isCorrect(moduleTwoQuestions.find(q=>q.id==='m2-g1'),'CO2'));
  const q=moduleTwoQuestions.find(q=>q.id==='m2-a3');assert.ok(isCorrect(q,'CO₃²⁻'));assert.equal(isCorrect(q,'CO3-'),false);
});
test('both intermediate and global equations conserve each element and total charge',()=>{
  const expected={C:3,H:5,O:5,charge:-1};
  for(const names of [['acid','bicarbonate'],['acetate','bicarbonate','proton'],['acetate','carbonic'],['acetate','water','gas']])assert.deepEqual(vinegarInventory(names),expected);
  for(let i=0;i<=100;i++){const f=vinegarFrame(i/100);assert.deepEqual(f.inventory,expected);assert.equal(f.donorCharge+f.acceptorCharge+f.protonCharge,-1);for(const p of [f.proton,f.carbon,f.waterO,f.otherH])assert.ok(p.every(Number.isFinite));}
  assert.equal(vinegarFrame(0).decompose,0);assert.equal(vinegarFrame(1).decompose,1);
});
test('changing the partner changes the role and conjugate species of bicarbonate',()=>{
  assert.deepEqual([amphotericModel('base').role,amphotericModel('base').product,amphotericModel('base').charge],['Base','H₂CO₃',0]);
  assert.deepEqual([amphotericModel('acid').role,amphotericModel('acid').product,amphotericModel('acid').charge],['Acide','CO₃²⁻',-2]);
});
