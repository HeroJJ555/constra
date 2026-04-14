export interface EvaluationResult {
  readonly satisfied: boolean;
  readonly penalty?: number;
  readonly variables?: string[];
  readonly reason?: string;
}

export interface Constraint {
  readonly id: string;
  readonly kind: 'hard' | 'soft';
  readonly weight?: number;
  scope(): string[];
  evaluate(assignments: Record<string, unknown>): EvaluationResult;
}
