export interface Violation {
  readonly constraintId: string;
  readonly penalty: number;
}

export type Solution = {
  readonly status: 'feasible' | 'infeasible';
  readonly assignments: Record<string, unknown>;
  readonly score: number;
  readonly violations: Violation[];
};
