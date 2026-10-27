import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCalculator,evaluateCalculator,calculatorScientific,calculatorMathHTML,calculatorAnswer} from '../calculator-engine.js';
import {formatFractionHTML} from '../math-format.js';
const calculatorClose=(actual,expected)=>assert.ok(Math.abs(actual-expected)<Math.max(1e-12,Math.abs(expected)*1e-12),`${actual} ≈ ${expected}`);
test('calculator respects arithmetic priority, grouping, unary signs and right-associative powers',()=>{
  for(const [source,result] of [['2+3*4',14],['(2+3)*4',20],['8/2/2',2],['2^3^2',512],['-2^2',-4],['(-2)^2',4],['2^-3',.125],['1-(2-3)',2],['2(3+4)',14]])calculatorClose(evaluateCalculator(source),result);
});
test('French decimals, scientific entry, Unicode powers and constants are accepted',()=>{
  for(const [source,result] of [['2,5e-3 × 4',.01],['10⁻³',.001],['√(4)',2],['2π',2*Math.PI],['ln(ℯ)',1],['log(1e-4)',-4],['1e+3',1000]]){calculatorClose(evaluateCalculator(source),result);}
  calculatorClose(evaluateCalculator('sqrt(4)'),2);calculatorClose(evaluateCalculator('abs(-7)'),7);calculatorClose(evaluateCalculator('exp(1)'),Math.E);
});
test('trigonometric functions and inverses honor degrees and radians',()=>{
  calculatorClose(evaluateCalculator('sin(30)'),.5);calculatorClose(evaluateCalculator('cos(60)'),.5);calculatorClose(evaluateCalculator('tan(45)'),1);calculatorClose(evaluateCalculator('sin(pi/2)',{angle:'RAD'}),1);calculatorClose(evaluateCalculator('asin(0,5)'),30);calculatorClose(evaluateCalculator('acos(0)',{angle:'RAD'}),Math.PI/2);calculatorClose(evaluateCalculator('atan(1)'),45);
});
test('factorials, percentages and Ans work without treating user text as code',()=>{
  assert.equal(evaluateCalculator('5!'),120);assert.equal(evaluateCalculator('0!'),1);calculatorClose(evaluateCalculator('20%'),.2);assert.equal(evaluateCalculator('Ans*2',{ans:12}),24);
  for(const source of ['globalThis','alert(1)','1;2','constructor','process.exit()','[1,2]','2**3'])assert.throws(()=>evaluateCalculator(source));
});
test('invalid domains, zero divisors, incomplete entries and excessive expressions are rejected',()=>{
  for(const source of ['1/0','sqrt(-1)','log(0)','ln(-1)','tan(90)','asin(2)','0^0','(-1)^0.5','171!','3.5!','2e309','2e','2e-','1e308*1e308','(2+3','2+','', '('.repeat(60)+'1'+')'.repeat(60),'1+'.repeat(210)+'1'])assert.throws(()=>evaluateCalculator(source),source);
});
test('scientific results cover zero, negative values and extreme finite magnitudes',()=>{
  for(const value of [0,.00403,-.12,1e-200,1e200]){const s=calculatorScientific(value);const back=Number(s.mantissa.replace(/\s/g,'').replace(',','.'))*10**s.exponent;calculatorClose(back,value);assert.ok(Number.isInteger(s.exponent));}assert.equal(calculatorScientific(Infinity),'');
});
test('calculator preview preserves divisions and power grouping as mathematical layout',()=>{
  const html=calculatorMathHTML(parseCalculator('(1+2)/(3*4)'));assert.equal((html.match(/class="math-frac"/g)||[]).length,1);assert.match(html,/math-num/);assert.match(html,/math-den/);assert.ok(!html.includes('/('));assert.ok(calculatorMathHTML(parseCalculator('2^(-3)')).includes('<sup>'));
});
test('typeset fractions preserve subscripts, parenthesized denominators and several quotients',()=>{
  for(const [source,count] of [['n = PV / (RT)',1],['n<sub>A</sub>/a = n<sub>B</sub>/b',2],['0,100 × 12,0 / 10,0',1],['[H₃O⁺]ₐ / [H₃O⁺]ᵦ',1],['C = (P/100) × d × ρ<sub>eau</sub> / M',2],['1 / 2 / 3',2]]){const html=formatFractionHTML(source);assert.equal((html.match(/class="math-frac"/g)||[]).length,count,source);assert.ok(!/[\uE000\uE001]/.test(html));}
  assert.ok(formatFractionHTML('n(A)/a').includes('>n(A)</span>'));assert.ok(formatFractionHTML('1 000 / 60').includes('>1 000</span>'));assert.ok(formatFractionHTML('n<sub>A</sub>/a').includes('<sub>A</sub>'));assert.ok(formatFractionHTML('PV / (RT)').includes('>RT</span>'));
});
test('chemical couples, progress counters and HTML attributes keep their own notation',()=>{
  for(const source of ['NH₄⁺ / NH₃','Acide / Base','H₃O⁺ / H₂O','Étape 1 / 4','Indice 1 / 2','<a href="./index.html">Déclic</a>'])assert.equal(formatFractionHTML(source),source);
  assert.equal((formatFractionHTML('Indice 1 / 2 : I / I₀').match(/class="math-frac"/g)||[]).length,1);
});

test('answer transfer removes binary rounding artifacts and retains usable scientific notation',()=>{assert.equal(calculatorAnswer(.1*12/10),'0,12');assert.equal(calculatorAnswer(1e-20),'1e-20');for(const value of [1/3,-.0000123456789,Math.PI,1e100])calculatorClose(Number(calculatorAnswer(value).replace(',','.')),value);assert.equal(calculatorAnswer(Infinity),'');});
