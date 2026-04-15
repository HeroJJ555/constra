import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { notIn, sameValue, ifThen, notEquals, notIn as notInAlias } from '../index';

describe('notIn', () => {
  it('is satisfied when value is not forbidden', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const c = notIn(a, [4, 5]);
    expect(c.evaluate({ a: 3 }).satisfied).toBe(true);
  });

  it('is violated when value is forbidden', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const c = notIn(a, [2, 3]);
    expect(c.evaluate({ a: 2 }).satisfied).toBe(false);
  });

  it('is satisfied when variable is not yet assigned', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const c = notIn(a, [1]);
    expect(c.evaluate({}).satisfied).toBe(true);
  });

  it('includes variable id and reason in violation', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const c = notIn(a, [1]);
    const result = c.evaluate({ a: 1 });
    expect(result.satisfied).toBe(false);
    expect(result.variables).toContain('a');
    expect(result.reason).toBeDefined();
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    expect(notIn(a, []).kind).toBe('hard');
  });

  it('reports correct scope', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    expect(notIn(a, [1]).scope()).toEqual(['a']);
  });

  it('works with string domains', () => {
    const model = createModel();
    const a = model.variable('a', domain.from(['T1', 'T2', 'T3']));
    const c = notIn(a, ['T1', 'T3']);
    expect(c.evaluate({ a: 'T2' }).satisfied).toBe(true);
    expect(c.evaluate({ a: 'T1' }).satisfied).toBe(false);
  });
});

describe('sameValue', () => {
  it('is satisfied when both values are equal', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    expect(sameValue(a, b).evaluate({ a: 2, b: 2 }).satisfied).toBe(true);
  });

  it('is violated when values differ', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    expect(sameValue(a, b).evaluate({ a: 1, b: 2 }).satisfied).toBe(false);
  });

  it('is satisfied when one variable is unassigned', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(sameValue(a, b).evaluate({ a: 1 }).satisfied).toBe(true);
  });

  it('includes variables and reason in violation', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    const result = sameValue(a, b).evaluate({ a: 1, b: 2 });
    expect(result.variables).toContain('a');
    expect(result.variables).toContain('b');
    expect(result.reason).toBeDefined();
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(sameValue(a, b).kind).toBe('hard');
  });

  it('reports correct scope', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(sameValue(a, b).scope()).toEqual(['a', 'b']);
  });
});

describe('ifThen', () => {
  it('is satisfied when condition does not hold', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    // condition: notIn(a, [1]) — satisfied when a≠1, not satisfied when a=1
    // consequence: notIn(b, [1])
    // If a=1, condition is violated → ifThen satisfied regardless of b
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    expect(c.evaluate({ a: 1, b: 1 }).satisfied).toBe(true);
  });

  it('requires consequence when condition holds', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    // condition: notIn(a, [1]) — satisfied when a=2
    // consequence: notIn(b, [1]) — violated when b=1
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    expect(c.evaluate({ a: 2, b: 1 }).satisfied).toBe(false);
  });

  it('is satisfied when condition and consequence both hold', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    expect(c.evaluate({ a: 2, b: 2 }).satisfied).toBe(true);
  });

  it('is satisfied on partial assignment where condition is undecided', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    expect(c.evaluate({}).satisfied).toBe(true);
  });

  it('includes scope from both condition and consequence', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    expect(c.scope()).toContain('a');
    expect(c.scope()).toContain('b');
  });

  it('includes reason in violation result', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([1]));
    const c = ifThen(notIn(a, [1]), notIn(b, [1]));
    const result = c.evaluate({ a: 2, b: 1 });
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('ifThen');
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(ifThen(notIn(a, []), notIn(b, [])).kind).toBe('hard');
  });
});
