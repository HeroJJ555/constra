import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { equals, notEquals, allDifferent, prefer } from '../index';

describe('equals', () => {
  it('is satisfied when both values are equal', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = equals(a, b);
    expect(c.evaluate({ a: 1, b: 1 }).satisfied).toBe(true);
  });

  it('is not satisfied when values differ', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = equals(a, b);
    expect(c.evaluate({ a: 1, b: 2 }).satisfied).toBe(false);
  });

  it('is satisfied when a variable is not yet assigned', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = equals(a, b);
    expect(c.evaluate({ a: 1 }).satisfied).toBe(true);
  });

  it('reports correct scope', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(equals(a, b).scope()).toEqual(['a', 'b']);
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(equals(a, b).kind).toBe('hard');
  });
});

describe('notEquals', () => {
  it('is satisfied when values differ', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = notEquals(a, b);
    expect(c.evaluate({ a: 1, b: 2 }).satisfied).toBe(true);
  });

  it('is not satisfied when values are equal', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = notEquals(a, b);
    expect(c.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('is satisfied when a variable is not yet assigned', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = notEquals(a, b);
    expect(c.evaluate({ a: 1 }).satisfied).toBe(true);
  });
});

describe('allDifferent', () => {
  it('is satisfied when all assigned values are unique', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const b = model.variable('b', domain.from([1, 2, 3]));
    const c = model.variable('c', domain.from([1, 2, 3]));
    const constraint = allDifferent([a, b, c]);
    expect(constraint.evaluate({ a: 1, b: 2, c: 3 }).satisfied).toBe(true);
  });

  it('is not satisfied when any two values are equal', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const constraint = allDifferent([a, b]);
    expect(constraint.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('detects duplicates in partial assignments', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const b = model.variable('b', domain.from([1, 2, 3]));
    const c = model.variable('c', domain.from([1, 2, 3]));
    const constraint = allDifferent([a, b, c]);
    expect(constraint.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('is satisfied on a single assigned value', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const constraint = allDifferent([a, b]);
    expect(constraint.evaluate({ a: 1 }).satisfied).toBe(true);
  });
});

describe('prefer', () => {
  it('always returns satisfied = true', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const c = prefer(a, (v) => v > 10, 5);
    expect(c.evaluate({ a: 1 }).satisfied).toBe(true);
  });

  it('returns penalty when predicate is false', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const c = prefer(a, (v) => v > 10, 5);
    expect(c.evaluate({ a: 1 }).penalty).toBe(5);
  });

  it('returns no penalty when predicate is true', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const c = prefer(a, (v) => v > 0, 5);
    expect(c.evaluate({ a: 1 }).penalty).toBeUndefined();
  });

  it('uses default weight of 1', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const c = prefer(a, () => false);
    expect(c.evaluate({ a: 1 }).penalty).toBe(1);
  });

  it('is satisfied when variable is not yet assigned', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const c = prefer(a, () => false, 10);
    expect(c.evaluate({}).satisfied).toBe(true);
    expect(c.evaluate({}).penalty).toBeUndefined();
  });

  it('is kind soft', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    expect(prefer(a, () => true).kind).toBe('soft');
  });
});
