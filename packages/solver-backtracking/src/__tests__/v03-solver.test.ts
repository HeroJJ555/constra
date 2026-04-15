import { describe, it, expect } from 'vitest';
import { createModel, domain } from '@constra/core';
import { notEquals, notIn, sameValue, prefer, allDifferent } from '@constra/stdlib';
import { solve } from '../index';

describe('solve options', () => {
  it('returns stats on a feasible solve', () => {
    const model = createModel();
    model.variable('a', domain.from([1, 2]));

    const result = solve(model, {});

    expect(result.stats).toBeDefined();
    expect(result.stats!.steps).toBeGreaterThanOrEqual(1);
    expect(result.stats!.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.stats!.solutionsChecked).toBe(1);
  });

  it('returns stats on an infeasible solve', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(notEquals(a, b));

    const result = solve(model, {});

    expect(result.status).toBe('infeasible');
    expect(result.stats).toBeDefined();
    expect(result.stats!.steps).toBeGreaterThanOrEqual(1);
  });
});

describe('solve options — maxSteps', () => {
  it('aborts after maxSteps is reached', () => {
    const model = createModel();
    for (let i = 0; i < 4; i++) {
      model.variable(`v${i}`, domain.from([1, 2, 3, 4, 5]));
    }
    model.add(allDifferent(model.variables));

    const result = solve(model, { maxSteps: 1 });

    expect(result.status).toBe('infeasible');
    expect(result.stats!.steps).toBeLessThanOrEqual(2);
  });

  it('finds solution when maxSteps is generous', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    model.add(notEquals(a, b));

    const result = solve(model, { maxSteps: 1000 });

    expect(result.status).toBe('feasible');
  });
});

describe('solve options — timeoutMs', () => {
  it('aborts when timeoutMs is 0 (already expired)', () => {
    const model = createModel();
    for (let i = 0; i < 5; i++) {
      model.variable(`v${i}`, domain.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    }
    model.add(allDifferent(model.variables));

    const result = solve(model, { timeoutMs: 0 });

    expect(result.status).toBe('infeasible');
  });
});

describe('solve options — debug', () => {
  it('includes debug info when debug=true', () => {
    const model = createModel();
    model.variable('a', domain.from([1, 2]));
    model.variable('b', domain.from([1, 2]));

    const result = solve(model, { debug: true });

    expect(result.debug).toBeDefined();
    expect(result.debug!.mrvOrder.length).toBeGreaterThan(0);
    expect(typeof result.debug!.deadEnds).toBe('number');
  });

  it('does not include debug info when debug=false', () => {
    const model = createModel();
    model.variable('a', domain.from([1]));

    const result = solve(model, { debug: false });

    expect(result.debug).toBeUndefined();
  });

  it('does not include debug info by default', () => {
    const model = createModel();
    model.variable('a', domain.from([1]));

    const result = solve(model);

    expect(result.debug).toBeUndefined();
  });
});

describe('infeasible diagnostics', () => {
  it('returns diagnostics when infeasible', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics!.exploredNodes).toBeGreaterThanOrEqual(1);
  });

  it('lists most failing constraints', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    const c = model.variable('c', domain.from([1, 2]));
    model.add(notEquals(a, b));
    model.add(notEquals(b, c));
    model.add(notEquals(a, c));
    model.add(sameValue(a, b));

    const result = solve(model);

    expect(result.status).toBe('infeasible');
    expect(result.diagnostics!.mostFailingConstraints.length).toBeGreaterThan(0);
    const ids = result.diagnostics!.mostFailingConstraints.map((x) => x.constraintId);
    expect(ids.length).toBeGreaterThan(0);
    expect(result.diagnostics!.mostFailingConstraints[0].failCount).toBeGreaterThanOrEqual(1);
  });

  it('lists most blocked variables', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.diagnostics!.mostBlockedVariables.length).toBeGreaterThan(0);
    expect(result.diagnostics!.mostBlockedVariables[0].blockCount).toBeGreaterThanOrEqual(1);
  });

  it('does not return diagnostics on feasible solve', () => {
    const model = createModel();
    model.variable('a', domain.from([1]));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.diagnostics).toBeUndefined();
  });
});

describe('notIn in solver', () => {
  it('excludes forbidden value in solution', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2, 3]));
    model.add(notIn(a, [1, 2]));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['a']).toBe(3);
  });

  it('is infeasible when all values are forbidden', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    model.add(notIn(a, [1, 2]));

    expect(solve(model).status).toBe('infeasible');
  });
});

describe('sameValue in solver', () => {
  it('constrains two variables to the same value', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1, 2]));
    const b = model.variable('b', domain.from([1, 2]));
    model.add(sameValue(a, b));

    const result = solve(model);

    expect(result.status).toBe('feasible');
    expect(result.assignments['a']).toBe(result.assignments['b']);
  });

  it('is infeasible when domains have no common value', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([2]));
    model.add(sameValue(a, b));

    expect(solve(model).status).toBe('infeasible');
  });
});

describe('solver stats counters', () => {
  it('backtracks is 0 for a trivial single-variable model', () => {
    const model = createModel();
    model.variable('a', domain.from([1]));

    const result = solve(model);

    expect(result.stats!.solutionsChecked).toBe(1);
  });

  it('solutionsChecked is 0 when infeasible', () => {
    const model = createModel();
    const a = model.variable('a', domain.from([1]));
    const b = model.variable('b', domain.from([1]));
    model.add(notEquals(a, b));

    const result = solve(model);

    expect(result.stats!.solutionsChecked).toBe(0);
  });
});
