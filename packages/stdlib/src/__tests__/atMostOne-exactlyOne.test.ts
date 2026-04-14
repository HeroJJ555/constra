import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { atMostOne, exactlyOne } from '../index';

describe('atMostOne', () => {
  it('is satisfied when no variable satisfies predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([3]));
    const c = atMostOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 2, b: 3 }).satisfied).toBe(true);
  });

  it('is satisfied when exactly one variable satisfies predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    const c = atMostOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 1, b: 2 }).satisfied).toBe(true);
  });

  it('is violated when two variables satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = atMostOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('is violated when three variables satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = model.variable('c', domain.from([1]));
    const constraint = atMostOne([a, b, c], (v) => v === 1);
    expect(constraint.evaluate({ a: 1, b: 1, c: 1 }).satisfied).toBe(false);
  });

  it('is satisfied on a partial assignment with one satisfying', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = atMostOne([a, b], (v) => v === 1);
    // b not yet assigned
    expect(c.evaluate({ a: 1 }).satisfied).toBe(true);
  });

  it('includes violating variable ids in result', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = atMostOne([a, b], (v) => v === 1);
    const result = c.evaluate({ a: 1, b: 1 });
    expect(result.variables).toContain('a');
    expect(result.variables).toContain('b');
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    expect(atMostOne([a], () => true).kind).toBe('hard');
  });

  it('reports correct scope', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(atMostOne([a, b], () => true).scope()).toEqual(['a', 'b']);
  });
});

describe('exactlyOne', () => {
  it('is satisfied when exactly one variable satisfies predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    const c = exactlyOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 1, b: 2 }).satisfied).toBe(true);
  });

  it('is violated when no variable satisfies predicate (all assigned)', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([3]));
    const c = exactlyOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 2, b: 3 }).satisfied).toBe(false);
  });

  it('is violated when two variables satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = exactlyOne([a, b], (v) => v === 1);
    expect(c.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('is undecided (satisfied=true) on a partial assignment with no satisfying yet', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([1]));
    const c = exactlyOne([a, b], (v) => v === 1);
    // a=2 does not satisfy, b not yet assigned — undecided
    expect(c.evaluate({ a: 2 }).satisfied).toBe(true);
  });

  it('is undecided (satisfied=true) on a partial assignment with one satisfying', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    const c_var = model.variable('c', domain.from([2]));
    const constraint = exactlyOne([a, b, c_var], (v) => v === 1);
    // a=1 satisfies, b not yet assigned — could still become violated
    expect(constraint.evaluate({ a: 1 }).satisfied).toBe(true);
  });

  it('prunes immediately when two assigned vars satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c_var = model.variable('c', domain.from([1, 2]));
    const constraint = exactlyOne([a, b, c_var], (v) => v === 1);
    // already two satisfy — violated before c is assigned
    expect(constraint.evaluate({ a: 1, b: 1 }).satisfied).toBe(false);
  });

  it('includes variable ids in violated result', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = exactlyOne([a, b], (v) => v === 1);
    const result = c.evaluate({ a: 1, b: 1 });
    expect(result.variables).toBeDefined();
    expect(result.variables!.length).toBeGreaterThan(0);
  });

  it('is kind hard', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    expect(exactlyOne([a], () => true).kind).toBe('hard');
  });

  it('reports correct scope', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    expect(exactlyOne([a, b], () => true).scope()).toEqual(['a', 'b']);
  });
});
