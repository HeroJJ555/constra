import type { Model, Solution, Violation } from '@constra/core';

export function solve(model: Model): Solution {
  const { variables, constraints } = model;
  const hardConstraints = constraints.filter((c) => c.kind === 'hard');
  const softConstraints = constraints.filter((c) => c.kind === 'soft');

  function backtrack(
    index: number,
    assignments: Record<string, unknown>,
  ): Solution | null {
    if (index === variables.length) {
      const violations: Violation[] = [];
      let score = 0;
      for (const constraint of softConstraints) {
        const result = constraint.evaluate(assignments);
        if (result.penalty !== undefined && result.penalty > 0) {
          score += result.penalty;
          violations.push({ constraintId: constraint.id, penalty: result.penalty });
        }
      }
      return {
        status: 'feasible',
        assignments: { ...assignments },
        score,
        violations,
      };
    }

    const variable = variables[index];

    for (const value of variable.domain.values) {
      assignments[variable.id] = value;

      let valid = true;
      for (const constraint of hardConstraints) {
        // Only evaluate when the newly assigned variable is in scope.
        // The evaluate function handles partial assignments gracefully,
        // returning satisfied=true when not all scope vars are assigned yet.
        if (constraint.scope().includes(variable.id)) {
          const result = constraint.evaluate(assignments);
          if (!result.satisfied) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        const result = backtrack(index + 1, assignments);
        if (result !== null) {
          return result;
        }
      }

      delete assignments[variable.id];
    }

    return null;
  }

  const result = backtrack(0, {});
  if (result === null) {
    return { status: 'infeasible', assignments: {}, score: 0, violations: [] };
  }
  return result;
}
