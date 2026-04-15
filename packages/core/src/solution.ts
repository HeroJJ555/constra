export interface Violation {
  readonly constraintId: string;
  readonly penalty: number;
  readonly variables?: string[];
  readonly reason?: string;
}

export interface SolverStats {
  readonly steps: number;
  readonly backtracks: number;
  readonly solutionsChecked: number;
  readonly elapsedMs: number;
}

export interface InfeasibleDiagnostics {
  readonly exploredNodes: number;
  readonly mostFailingConstraints: { constraintId: string; failCount: number }[];
  readonly mostBlockedVariables: { variableId: string; blockCount: number }[];
}

export interface DebugInfo {
  readonly mrvOrder: string[];
  readonly deadEnds: number;
}

export type Solution = {
  readonly status: 'feasible' | 'infeasible';
  readonly assignments: Record<string, unknown>;
  readonly score: number;
  readonly violations: Violation[];
  readonly stats?: SolverStats;
  readonly diagnostics?: InfeasibleDiagnostics;
  readonly debug?: DebugInfo;
};

export interface SolveOptions {
  readonly timeoutMs?: number;
  readonly maxSteps?: number;
  readonly debug?: boolean;
}
