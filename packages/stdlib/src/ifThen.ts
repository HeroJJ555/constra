import type { Constraint } from '@constra/core';

export function ifThen(condition: Constraint, consequence: Constraint): Constraint {
  const scopeIds = [...new Set([...condition.scope(), ...consequence.scope()])];
  return {
    id: `ifThen(${condition.id},${consequence.id})`,
    kind: 'hard',
    scope() {
      return scopeIds;
    },
    evaluate(assignments) {
      const condResult = condition.evaluate(assignments);
      if (!condResult.satisfied) return { satisfied: true };
      const consResult = consequence.evaluate(assignments);
      if (!consResult.satisfied) {
        return {
          satisfied: false,
          variables: consResult.variables,
          reason: `ifThen: condition ${condition.id} holds but consequence ${consequence.id} is violated`,
        };
      }
      return { satisfied: true };
    },
  };
}
