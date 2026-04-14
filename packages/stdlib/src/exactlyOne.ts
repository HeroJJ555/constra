import type { Constraint, Variable } from '@constra/core';

export function exactlyOne<T = unknown>(
  vars: Variable<T>[],
  predicate: (value: T) => boolean,
): Constraint {
  const ids = vars.map((v) => v.id);
  return {
    id: `exactlyOne(${ids.join(',')})`,
    kind: 'hard',
    scope() {
      return ids;
    },
    evaluate(assignments) {
      const assignedIds = ids.filter((id) => assignments[id] !== undefined);
      const satisfying = assignedIds.filter((id) =>
        predicate(assignments[id] as T),
      );

      if (satisfying.length > 1) {
        return {
          satisfied: false,
          variables: satisfying,
          reason: `More than one variable satisfies the predicate: ${satisfying.join(', ')}`,
        };
      }

      const allAssigned = assignedIds.length === ids.length;

      if (allAssigned && satisfying.length !== 1) {
        return {
          satisfied: false,
          variables: ids,
          reason:
            satisfying.length === 0
              ? `No variable satisfies the predicate`
              : `More than one variable satisfies the predicate`,
        };
      }

      return { satisfied: true };
    },
  };
}
