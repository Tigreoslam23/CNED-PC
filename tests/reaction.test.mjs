import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reactionFrame } from '../reaction.js';

test('the same six H atoms and total charge +1 are conserved throughout the transfer', () => {
  for (let i = 0; i <= 100; i++) {
    const frame = reactionFrame(i / 100);
    assert.deepEqual(frame.atoms, { H: 6, O: 1, N: 1 });
    assert.equal(frame.donorCharge + frame.protonCharge + frame.acceptorCharge, 1);
    assert.equal(frame.totalCharge, 1);
    assert.equal(frame.donorCharge && frame.acceptorCharge, 0);
  }
});

test('the transfer starts with oxonium and ammonia and finishes with water and ammonium', () => {
  const before = reactionFrame(0), after = reactionFrame(1);
  assert.deepEqual([before.donorFormula, before.acceptorFormula], ['H₃O⁺', 'NH₃']);
  assert.deepEqual([after.donorFormula, after.acceptorFormula], ['H₂O', 'NH₄⁺']);
  assert.equal(before.donorBond, 1); assert.equal(before.acceptorBond, 0);
  assert.equal(after.donorBond, 0); assert.equal(after.acceptorBond, 1);
  assert.deepEqual([before.x, before.y], [185, 100]);
  assert.ok(Math.abs(after.x - 460) < 1e-10 && Math.abs(after.y - 100) < 1e-10);
});

test('moving the proton never moves it backwards or forms both bonds at once', () => {
  let previous = 185;
  for (let i = 0; i <= 100; i++) {
    const f = reactionFrame(i / 100);
    assert.ok(f.x >= previous && f.x <= 460); previous = f.x;
    assert.ok(!(f.donorBond > 0 && f.acceptorBond > 0));
    assert.ok(Number.isFinite(f.y));
  }
  assert.equal(reactionFrame(-3).stage, 0); assert.equal(reactionFrame(9).stage, 3);
});
