import type { Constraint, Variable } from '@constra/core';

export function atMostOne<T = unknown>(
  vars: Variable<T>[],
  predicate: (value: T) => boolean,
): Constraint {
  const ids = vars.map((v) => v.id);
  return {
    id: `atMostOne(${ids.join(',')})`,
    kind: 'hard',
    scope() {
      return ids;
    },
    evaluate(assignments) {
      const satisfying = ids.filter((id) => {
        const v = assignments[id] as T | undefined;
        return v !== undefined && predicate(v);
      });
      if (satisfying.length > 1) {
        return {
          satisfied: false,
          variables: satisfying,
          reason: `More than one variable satisfies the predicate: ${satisfying.join(', ')}`,
        };
      }
      return { satisfied: true };
    },
  };
}
