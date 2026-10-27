const mathEscape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mathFraction(numerator,denominator){const plain=value=>String(value).replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ');return `<span class="math-frac" role="math" aria-label="${mathEscape(plain(numerator)+' divisé par '+plain(denominator))}"><span class="math-num">${numerator}</span><span class="math-den">${denominator}</span></span>`;}
export function formatFractionHTML(source){
  const pool=[];const save=html=>'\uE000'+(pool.push(html)-1)+'\uE001';
  const decode=text=>text.replace(/\uE000(\d+)\uE001/g,(_,i)=>decode(pool[Number(i)]));
  let html=String(source).replace(/<(sub|sup)\b[^>]*>[\s\S]*?<\/\1>/gi,save);
  const marker=String.raw`\uE000\d+\uE001`,number=String.raw`[−-]?(?:\d{1,3}(?:[ \u00A0\u202F]\d{3})+|\d+)(?:[.,]\d+)?(?:e[+-]?\d+)?`,symbol=String.raw`(?:n\([^()<>]+\)|Kcell|PV|RT|pH|c°|[nmMVCBAPRTGIUabcdkℓεσρ])`,decoration=String.raw`(?:${marker}|[₀-₉ₐₑᵦ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺°])`,simple=String.raw`(?:(?:${number}|${symbol})(?:${decoration})*|${marker}|\[[^<>\[\]]+\](?:${decoration})*)`,atom=String.raw`(?:\([^()<>]+\)|(?:${simple})+)`;
  const quotient=new RegExp(String.raw`(?<![\p{L}\p{N}_/>])(${atom})\s*\/\s*(${atom})(?![\p{L}\p{N}_])`,'gu');
  const unwrap=value=>value.startsWith('(')&&value.endsWith(')')?value.slice(1,-1):value;
  html=html.split(/(<[^>]*>)/g).map(part=>{if(part.startsWith('<'))return part;let out=part;for(let pass=0;pass<8;pass++){const previous=out;out=out.replace(quotient,(match,n,d,offset,text)=>/(?:Étape|ÉTAPE|Indice|Question)\s*$/i.test(text.slice(0,offset))?match:save(mathFraction(decode(unwrap(n)),decode(unwrap(d)))));if(out===previous)break;}return out;}).join('');
  return decode(html);
}
export function formatFractionsIn(root){
  if(!root)return;const allowed=new Set(['SUB','SUP','EM','B','STRONG','I','BR']);
  const excluded='svg,math,input,textarea,select,code,pre,.math-frac,.breadcrumb,.figure-label,.eyebrow,.badge,.journey-progress,.session-top,.score,.stat-grid,.skill-row,[role="progressbar"],.m8-hero-path';
  const nodes=[root,...root.querySelectorAll('*')].reverse();
  for(const el of nodes){if(el.closest(excluded)||el.querySelector('.math-frac')||!el.textContent.includes('/'))continue;if([...el.children].some(child=>!allowed.has(child.tagName)))continue;const before=el.innerHTML,after=formatFractionHTML(before);if(before!==after)el.innerHTML=after;}
}
export function watchMathFractions(roots){let scheduled=false;const update=()=>{scheduled=false;roots.forEach(formatFractionsIn);};const observer=new MutationObserver(records=>{if(records.every(record=>record.target.parentElement?.closest('.math-frac')))return;if(!scheduled){scheduled=true;queueMicrotask(update);}});for(const root of roots)observer.observe(root,{childList:true,subtree:true,characterData:true});update();return()=>observer.disconnect();}
