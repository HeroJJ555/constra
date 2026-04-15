import type { Model, Solution, SolveOptions, Variable, Violation } from '@constra/core';

export function solve(model: Model, options: SolveOptions = {}): Solution {
  const { variables, constraints } = model;
  const hardConstraints = constraints.filter((c) => c.kind === 'hard');
  const softConstraints = constraints.filter((c) => c.kind === 'soft');

  const startMs = Date.now();
  const deadline = options.timeoutMs !== undefined ? startMs + options.timeoutMs : Infinity;
  const maxSteps = options.maxSteps ?? Infinity;

  let steps = 0;
  let backtracks = 0;
  let solutionsChecked = 0;
  let deadEnds = 0;
  let aborted = false;

  const failCounts = new Map<string, number>();
  const blockCounts = new Map<string, number>();
  const mrvOrder: string[] = [];

  function recordFail(assignments: Record<string, unknown>, failingConstraintId: string) {
    failCounts.set(failingConstraintId, (failCounts.get(failingConstraintId) ?? 0) + 1);
    for (const id of Object.keys(assignments)) {
      blockCounts.set(id, (blockCounts.get(id) ?? 0) + 1);
    }
  }

  function backtrack(
    unassigned: Variable[],
    assignments: Record<string, unknown>,
  ): Solution | null {
    if (aborted) return null;

    if (unassigned.length === 0) {
      solutionsChecked++;
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

    if (options.debug) mrvOrder.push(variable.id);

    const remaining = unassigned.filter((v) => v !== variable);
    let branchSucceeded = false;

    for (const value of variable.domain.values) {
      if (Date.now() >= deadline || steps >= maxSteps) {
        aborted = true;
        return null;
      }

      steps++;
      assignments[variable.id] = value;

      let valid = true;
      let failingConstraintId: string | undefined;
      for (const constraint of hardConstraints) {
        if (!constraint.evaluate(assignments).satisfied) {
          valid = false;
          failingConstraintId = constraint.id;
          break;
        }
      }

      if (valid) {
        const result = backtrack(remaining, assignments);
        if (result !== null) return result;
        if (aborted) {
          delete assignments[variable.id];
          return null;
        }
        backtracks++;
      } else {
        if (failingConstraintId) recordFail(assignments, failingConstraintId);
        deadEnds++;
      }

      delete assignments[variable.id];
    }

    if (!branchSucceeded) backtracks++;
    return null;
  }

  const found = backtrack([...variables], {});
  const elapsedMs = Date.now() - startMs;

  const stats = {
    steps,
    backtracks,
    solutionsChecked,
    elapsedMs,
  };

  if (found !== null) {
    return {
      ...found,
      stats,
      debug: options.debug
        ? { mrvOrder: [...new Set(mrvOrder)], deadEnds }
        : undefined,
    };
  }

  const sortedConstraints = [...failCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([constraintId, failCount]) => ({ constraintId, failCount }));

  const sortedVariables = [...blockCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([variableId, blockCount]) => ({ variableId, blockCount }));

  return {
    status: 'infeasible',
    assignments: {},
    score: 0,
    violations: [],
    stats,
    diagnostics: {
      exploredNodes: steps,
      mostFailingConstraints: sortedConstraints,
      mostBlockedVariables: sortedVariables,
    },
    debug: options.debug
      ? { mrvOrder: [...new Set(mrvOrder)], deadEnds }
      : undefined,
  };
}

