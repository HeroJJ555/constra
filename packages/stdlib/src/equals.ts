import type { Constraint, Variable } from '@constra/core';

export function equals(a: Variable, b: Variable): Constraint {
  return {
    id: `equals(${a.id},${b.id})`,
    kind: 'hard',
    scope() {
      return [a.id, b.id];
    },
    evaluate(assignments) {
      const aVal = assignments[a.id];
      const bVal = assignments[b.id];
      if (aVal === undefined || bVal === undefined) {
        return { satisfied: true };
      }
      return { satisfied: aVal === bVal };
    },
  };
}
