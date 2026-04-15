import type { Constraint, Variable } from '@constra/core';

export function notIn<T = unknown>(
  variable: Variable<T>,
  forbiddenValues: T[],
): Constraint {
  const forbidden = new Set(forbiddenValues);
  return {
    id: `notIn(${variable.id},[${forbiddenValues.join(',')}])`,
    kind: 'hard',
    scope() {
      return [variable.id];
    },
    evaluate(assignments) {
      const val = assignments[variable.id] as T | undefined;
      if (val === undefined) return { satisfied: true };
      if (forbidden.has(val)) {
        return {
          satisfied: false,
          variables: [variable.id],
          reason: `${variable.id} = ${String(val)} is forbidden`,
        };
      }
      return { satisfied: true };
    },
  };
}
