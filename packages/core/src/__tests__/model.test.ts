import { describe, it, expect } from 'vitest';
import { createModel, domain } from '../index';

describe('domain', () => {
  it('stores provided values', () => {
    const d = domain.from([1, 2, 3]);
    expect(d.values).toEqual([1, 2, 3]);
  });

  it('does not share array reference with input', () => {
    const input = [1, 2, 3];
    const d = domain.from(input);
    input.push(4);
    expect(d.values).toHaveLength(3);
  });
});

describe('createModel', () => {
  it('starts empty', () => {
    const model = createModel();
    expect(model.variables).toHaveLength(0);
    expect(model.constraints).toHaveLength(0);
  });

  it('registers a variable', () => {
    const model = createModel();
    const x = model.variable('x', domain.from([1, 2, 3]));
    expect(x.id).toBe('x');
    expect(x.domain.values).toEqual([1, 2, 3]);
    expect(model.variables).toHaveLength(1);
    expect(model.variables[0]).toBe(x);
  });

  it('registers multiple variables', () => {
    const model = createModel();
    model.variable('a', domain.from([1]));
    model.variable('b', domain.from([2]));
    expect(model.variables).toHaveLength(2);
  });

  it('registers a constraint', () => {
    const model = createModel();
    const stub = {
      id: 'stub',
      kind: 'hard' as const,
      scope: () => [],
      evaluate: () => ({ satisfied: true }),
    };
    model.add(stub);
    expect(model.constraints).toHaveLength(1);
    expect(model.constraints[0]).toBe(stub);
  });
});
