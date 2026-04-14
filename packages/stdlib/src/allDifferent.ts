import type { Constraint, Variable } from '@constra/core';

export function allDifferent(vars: Variable[]): Constraint {
  const ids = vars.map((v) => v.id);
  return {
    id: `allDifferent(${ids.join(',')})`,
    kind: 'hard',
    scope() {
      return ids;
    },
    evaluate(assignments) {
      const assigned = ids
        .map((id) => assignments[id])
        .filter((v) => v !== undefined);
      const unique = new Set(assigned);
      return { satisfied: unique.size === assigned.length };
    },
  };
}
