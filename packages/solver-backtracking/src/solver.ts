import type { Model, Solution, Variable, Violation } from '@constra/core';

export function solve(model: Model): Solution {
  const { variables, constraints } = model;
  const hardConstraints = constraints.filter((c) => c.kind === 'hard');
  const softConstraints = constraints.filter((c) => c.kind === 'soft');

  function backtrack(
    unassigned: Variable[],
    assignments: Record<string, unknown>,
  ): Solution | null {
    if (unassigned.length === 0) {
      const violations: Violation[] = [];
      let score = 0;
      for (const constraint of softConstraints) {
        const result = constraint.evaluate(assignments);
        if (result.penalty !== undefined && result.penalty > 0) {
          score += result.penalty;
          violations.push({
            constraintId: constraint.id,
            penalty: result.penalty,
            variables: result.variables,
            reason: result.reason,
          });
        }
      }
      return {
        status: 'feasible',
        assignments: { ...assignments },
        score,
        violations,
      };
    }
    const variable = unassigned.reduce((best, v) =>
      v.domain.values.length < best.domain.values.length ? v : best,
    );
    const remaining = unassigned.filter((v) => v !== variable);

    for (const value of variable.domain.values) {
      assignments[variable.id] = value;
      let valid = true;
      for (const constraint of hardConstraints) {
        if (!constraint.evaluate(assignments).satisfied) {
          valid = false;
          break;
        }
      }

      if (valid) {
        const result = backtrack(remaining, assignments);
        if (result !== null) return result;
      }

      delete assignments[variable.id];
    }

    return null;
  }

  const result = backtrack([...variables], {});
  if (result === null) {
    return { status: 'infeasible', assignments: {}, score: 0, violations: [] };
  }
  return result;
}
