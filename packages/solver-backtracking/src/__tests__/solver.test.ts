import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { equals, notEquals, allDifferent, prefer, atMostOne, exactlyOne } from '@constra/stdlib';
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

// ── MRV ────────────────────────────────────────────────────────────────────────

describe('MRV heuristic', () => {
  it('picks the variable with the smallest domain first', () => {
    // y has domain size 1 → MRV must pick it before z (size 2) and x (size 3).
    // notEquals(y, z): y=1 forces z=2 (only valid value left).
    // Without MRV the solver would still find a solution, but we verify the
    // result matches what MRV-order assignment produces deterministically.
    const model = createModel();
    const x = model.variable('x', domain.from([1, 2, 3])); // size 3
    const y = model.variable('y', domain.from([1]));        // size 1 — must be picked first
    const z = model.variable('z', domain.from([1, 2]));     // size 2

    model.add(notEquals(y, z));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['y']).toBe(1);       // forced
    expect(result.assignments['z']).toBe(2);       // forced by notEquals(y=1, z)
    // x is unconstrained — first domain value wins
    expect(result.assignments['x']).toBe(1);
  });

  it('selects among tied domains by original variable order', () => {
    // a and b both have domain size 1 — a comes first, so a is picked first.
    // notEquals forces infeasible since both must equal 5.
    const model = createModel();
    const a = model.variable('a', domain.from([5]));
    const b = model.variable('b', domain.from([5]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
  });

  it('solves correctly regardless of declaration order when MRV reorders', () => {
    // Declare large-domain var first, small-domain var second.
    // MRV should still pick the small one first and find the only solution.
    const model = createModel();
    const big   = model.variable('big',   domain.from([1, 2, 3, 4, 5]));
    const small = model.variable('small', domain.from([42]));

    model.add(notEquals(big, small));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['small']).toBe(42);
    expect(result.assignments['big']).not.toBe(42);
  });
});

// ── Partial constraint evaluation ─────────────────────────────────────────────

describe('partial constraint evaluation', () => {
  it('hard constraints do not reject a branch on partial assignments', () => {
    // allDifferent over 3 vars: assigning the first should not fail even though
    // the other two are still unassigned.
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    const b = model.variable('b', domain.from([1, 2, 3]));
    const c = model.variable('c', domain.from([1, 2, 3]));
    model.add(allDifferent([a, b, c]));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    const vals = Object.values(result.assignments);
    expect(new Set(vals).size).toBe(3);
  });

  it('prunes immediately when a partial assignment violates a hard constraint', () => {
    // allDifferent: assigning a=1 and b=1 should be pruned before c is tried.
    // Only valid solutions have all three different.
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    const c = model.variable('c', domain.from([1, 2, 3]));
    model.add(allDifferent([a, b, c]));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
  });
});

// ── Violations metadata ────────────────────────────────────────────────────────

describe('violation metadata', () => {
  it('violations include variables and reason from prefer', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    model.add(prefer(a, (v) => v > 10, 5));

    const result = solve(model);

    expect(result.violations).toHaveLength(1);
    const v = result.violations[0];
    expect(v.variables).toEqual(['a']);
    expect(v.reason).toContain('a');
  });

  it('violation reason includes the assigned value', () => {
    const model = createModel();
    const x = model.variable('x', domain.from(['bad']));
    model.add(prefer(x, (v) => v === 'good', 1));

    const result = solve(model);

    expect(result.violations[0].reason).toContain('bad');
  });
});

// ── atMostOne and exactlyOne ───────────────────────────────────────────────────

describe('atMostOne in solver', () => {
  it('is feasible when zero vars satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([3]));
    model.add(atMostOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('feasible');
  });

  it('is feasible when exactly one var satisfies predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    model.add(atMostOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('feasible');
  });

  it('is infeasible when both vars are forced to satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(atMostOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('infeasible');
  });
});

describe('exactlyOne in solver', () => {
  it('is feasible when exactly one var satisfies predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    model.add(exactlyOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('feasible');
  });

  it('is infeasible when no var can satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([2]));
    const b = model.variable('b', domain.from([3]));
    model.add(exactlyOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('infeasible');
  });

  it('is infeasible when two vars are forced to satisfy predicate', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(exactlyOne([a, b], (v) => v === 1));

    expect(solve(model).status).toBe('infeasible');
  });

  it('solver finds the assignment where exactly one satisfies', () => {
    // a in [1,2], b in [1,2]: exactlyOne must satisfy v===1
    // valid: a=1,b=2 or a=2,b=1
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    model.add(exactlyOne([a, b], (v) => v === 1));

    const result = solve(model);
    expect(result.status).toBe('feasible');
    const satisfying = [result.assignments['a'], result.assignments['b']].filter((v) => v === 1);
    expect(satisfying).toHaveLength(1);
  });
});

// ── Timetable integration ──────────────────────────────────────────────────────

describe('timetable integration', () => {
  it('solves a small timetable with all constraint types', () => {
    const model = createModel();
    const mathSlot    = model.variable('math_slot',    domain.from(['T1', 'T2', 'T3', 'T4']));
    const englishSlot = model.variable('english_slot', domain.from(['T1', 'T2', 'T3', 'T4']));
    const scienceSlot = model.variable('science_slot', domain.from(['T1', 'T2', 'T3', 'T4']));

    const mathTeacher    = model.variable('math_teacher',    domain.from(['alice', 'bob', 'carol']));
    const englishTeacher = model.variable('english_teacher', domain.from(['alice', 'bob', 'carol']));
    const scienceTeacher = model.variable('science_teacher', domain.from(['alice', 'bob', 'carol']));

    model.add(allDifferent([mathSlot, englishSlot, scienceSlot]));
    model.add(allDifferent([mathTeacher, englishTeacher, scienceTeacher]));
    model.add(exactlyOne([mathSlot, englishSlot, scienceSlot], (s) => s === 'T1'));
    model.add(atMostOne([mathSlot, englishSlot, scienceSlot],  (s) => s === 'T4'));

    model.add(prefer(mathTeacher,    (t) => t === 'alice', 3));
    model.add(prefer(scienceTeacher, (t) => t === 'carol', 3));
    model.add(prefer(englishSlot,    (s) => s === 'T1' || s === 'T2', 2));

    const result = solve(model);

    expect(result.status).toBe('feasible');

    // allDifferent on slots
    const slots = [result.assignments['math_slot'], result.assignments['english_slot'], result.assignments['science_slot']];
    expect(new Set(slots).size).toBe(3);

    // allDifferent on teachers
    const teachers = [result.assignments['math_teacher'], result.assignments['english_teacher'], result.assignments['science_teacher']];
    expect(new Set(teachers).size).toBe(3);

    // exactlyOne in T1
    expect(slots.filter((s) => s === 'T1')).toHaveLength(1);

    // atMostOne in T4
    expect(slots.filter((s) => s === 'T4').length).toBeLessThanOrEqual(1);
  });
});
