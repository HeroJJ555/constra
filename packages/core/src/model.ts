import type { Domain } from './domain';
import type { Variable } from './variable';
import type { Constraint } from './constraint';

export interface Model {
  readonly variables: Variable[];
  readonly constraints: Constraint[];
  variable<T>(id: string, domain: Domain<T>): Variable<T>;
  add(constraint: Constraint): void;
}

export function createModel(): Model {
  const variables: Variable[] = [];
  const constraints: Constraint[] = [];

  return {
    variables,
    constraints,
    variable<T>(id: string, domain: Domain<T>): Variable<T> {
      const v: Variable<T> = { id, domain };
      variables.push(v as Variable<unknown>);
      return v;
    },
    add(constraint: Constraint): void {
      constraints.push(constraint);
    },
  };
}
