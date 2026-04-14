export interface Violation {
  readonly constraintId: string;
  readonly penalty: number;
  readonly variables?: string[];
  readonly reason?: string;
}

export type Solution = {
  readonly status: 'feasible' | 'infeasible';
  readonly assignments: Record<string, unknown>;
  readonly score: number;
  readonly violations: Violation[];
};
