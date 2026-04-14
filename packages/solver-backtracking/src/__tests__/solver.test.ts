import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { equals, notEquals, allDifferent, prefer } from '@constra/stdlib';
import { solve } from '../index';

describe('solve', () => {
  it('returns the exact example from the spec (notEquals)', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['a']).not.toBe(result.assignments['b']);
  });

  it('returns infeasible when no assignment satisfies hard constraints', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
    expect(result.assignments).toEqual({});
    expect(result.score).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  it('returns infeasible with empty domain', () => {
    const model = createModel();
    model.variable('a', domain.from([]));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
  });

  it('solves a model with no constraints', () => {
    const model = createModel();
    model.variable('a', domain.from([42]));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['a']).toBe(42);
    expect(result.score).toBe(0);
  });

  it('solves allDifferent with 3 variables', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const b = model.variable('b', domain.from([1, 2, 3]));
    const c = model.variable('c', domain.from([1, 2, 3]));
    model.add(allDifferent([a, b, c]));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    const vals = [result.assignments['a'], result.assignments['b'], result.assignments['c']];
    expect(new Set(vals).size).toBe(3);
  });

  it('accumulates penalties from soft constraints', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    model.add(prefer(a, (v) => v > 10, 7));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.score).toBe(7);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].constraintId).toBe('prefer(a)');
    expect(result.violations[0].penalty).toBe(7);
  });

  it('sums multiple soft penalties', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    model.add(prefer(a, (v) => v > 10, 3));
    model.add(prefer(b, (v) => v > 10, 5));

    const result = solve(model);

    expect(result.score).toBe(8);
    expect(result.violations).toHaveLength(2);
  });

  it('soft constraints never block a solution', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    model.add(prefer(a, (v) => v > 100, 999));

    const result = solve(model);

    expect(result.status).toBe('feasible');
  });

  it('hard constraints reject branches eagerly (equals)', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([3, 4]));
    model.add(equals(a, b));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
  });

  it('score is 0 when all soft predicates are satisfied', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([5]));
    model.add(prefer(a, (v) => v === 5, 10));

    const result = solve(model);

    expect(result.score).toBe(0);
    expect(result.violations).toHaveLength(0);
  });
});
