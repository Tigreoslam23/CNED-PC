import { isCorrect, parseNumericAnswer } from './core.js';
import { chapterDiagnostic, chapterCases } from './chapter-content.js';
import { chapterBacCases } from './chapter-bac-content.js';
export const CHAPTER_STORAGE_KEY='declic-chapitre1-bilan-v1';
export function chapterEmpty(){return {version:1,diagnostic:null,reports:[],cases:{}};}
export function chapterValidAnswer(q,value){if(value===null)return true;return q.type==='choice'?Number.isInteger(value)&&value>=0&&value<q.options.length:typeof value==='string'&&value.length<=(q.type==='written'?3000:400);}
export function chapterRecord(q,answer,assisted=false){return {id:q.id,answer,correct:q.type!=='written'&&answer!==null&&isCorrect(q,answer),assisted:Boolean(assisted),...(q.type==='written'?{selfPoints:null}:{})};}
export function chapterRead(storage){
  const empty=chapterEmpty();
  try{
    const raw=JSON.parse(storage?.getItem(CHAPTER_STORAGE_KEY));if(raw?.version!==1)return empty;
    const clean=(records,bank)=>{if(!Array.isArray(records)||records.length>bank.length)return null;const result=[];for(let i=0;i<records.length;i++){const r=records[i],q=bank[i];if(!r||r.id!==q.id||!chapterValidAnswer(q,r.answer))return null;const record=chapterRecord(q,r.answer,r.assisted);if(q.type==='written'&&Number.isInteger(r.selfPoints)&&r.selfPoints>=0&&r.selfPoints<=q.points)record.selfPoints=r.selfPoints;result.push(record);}return result;};
    const draft=(value,q)=>q&&chapterValidAnswer(q,value)?value:null;
    if(raw.diagnostic){const records=clean(raw.diagnostic.records,chapterDiagnostic);if(records&&records.length<chapterDiagnostic.length)empty.diagnostic={records,draft:draft(raw.diagnostic.draft,chapterDiagnostic[records.length])};}
    if(Array.isArray(raw.reports))for(const report of raw.reports.slice(-5)){const records=clean(report?.records,chapterDiagnostic);if(records?.length===18)empty.reports.push({records:records.map(r=>({...r,assisted:false})),date:typeof report.date==='string'?report.date:''});}
    for(const c of [...chapterCases,...chapterBacCases]){const saved=raw.cases?.[c.id];if(!saved)continue;const records=clean(saved.records,c.questions);if(!records)continue;const showLast=Boolean(saved.showLast&&records.length);empty.cases[c.id]={records,draft:draft(saved.draft,c.questions[records.length]),hints:Number.isInteger(saved.hints)?Math.max(0,Math.min(3,saved.hints)):0,showLast};}
    return empty;
  }catch{return empty;}
}
export function chapterScore(records){return records.filter(r=>r.correct&&!r.assisted).length;}
export function chapterBacScore(c,records){let auto=0,autoMax=0,written=0,writtenMax=0,unassessed=0;for(let i=0;i<c.questions.length;i++){const q=c.questions[i],r=records[i];if(q.type==='written'){writtenMax+=q.points;if(Number.isInteger(r?.selfPoints)&&r.selfPoints>=0&&r.selfPoints<=q.points)written+=r.selfPoints;else unassessed++;}else{autoMax+=q.points;if(r?.correct&&!r.assisted)auto+=q.points;}}return {auto,autoMax,written,writtenMax,unassessed,total:auto+written};}
export function chapterModuleResults(report){return Array.from({length:9},(_,i)=>{const module=String(i+1),records=(report?.records||[]).filter(r=>chapterDiagnostic.find(q=>q.id===r.id)?.module===module);return {module,total:records.length,correct:records.filter(r=>r.correct).length};});}
export function chapterFeedback(q,answer){
  if(answer===null)return 'Question non répondue. La correction permet de reprendre le raisonnement.';
  if(isCorrect(q,answer))return q.explanation;
  if(q.type==='choice'&&q.errors?.[answer])return q.errors[answer];
  if(q.type==='number'){const value=parseNumericAnswer(answer);for(const mistake of q.mistakes||[]){if(Number.isFinite(value)&&Math.abs(value-mistake.value)<=Math.max(Math.abs(mistake.value)*.005,1e-9))return mistake.text;}return 'Vérifie les unités, la relation choisie, les puissances de dix et l’arrondi demandé.';}
  return q.type==='formula'?'Compte les hydrogènes et vérifie la charge après le transfert d’un seul H⁺.':'Reprends les informations de l’énoncé et le rôle de chaque grandeur.';
}
export function chapterTargets(report){const seen=new Set();return (report?.records||[]).filter(r=>!r.correct).map(r=>{const q=chapterDiagnostic.find(q=>q.id===r.id);return {...q,message:chapterFeedback(q,r.answer)};}).filter(q=>{const key=q.module+':'+q.lesson;if(seen.has(key))return false;seen.add(key);return true;});}
