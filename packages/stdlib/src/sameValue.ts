import type { Constraint, Variable } from '@constra/core';

export function sameValue(a: Variable, b: Variable): Constraint {
  return {
    id: `sameValue(${a.id},${b.id})`,
    kind: 'hard',
    scope() {
      return [a.id, b.id];
    },
    evaluate(assignments) {
      const aVal = assignments[a.id];
      const bVal = assignments[b.id];
      if (aVal === undefined || bVal === undefined) return { satisfied: true };
      if (aVal !== bVal) {
        return {
          satisfied: false,
          variables: [a.id, b.id],
          reason: `${a.id} = ${String(aVal)} ≠ ${b.id} = ${String(bVal)}`,
        };
      }
      return { satisfied: true };
    },
  };
}
