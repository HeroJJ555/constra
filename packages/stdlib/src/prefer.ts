import type { Constraint, Variable } from '@constra/core';

export function prefer<T>(
  variable: Variable<T>,
  predicate: (value: T) => boolean,
  weight: number = 1,
): Constraint {
  return {
    id: `prefer(${variable.id})`,
    kind: 'soft',
    weight,
    scope() {
      return [variable.id];
    },
    evaluate(assignments) {
      const val = assignments[variable.id] as T | undefined;
      if (val === undefined) {
        return { satisfied: true };
      }
      if (predicate(val)) {
        return { satisfied: true };
      }
      return { satisfied: true, penalty: weight };
    },
  };
}
