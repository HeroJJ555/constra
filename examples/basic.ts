import { createModel, domain } from '@constra/core';
import { notEquals, allDifferent, prefer } from '@constra/stdlib';
import { solve } from '@constra/solver-backtracking';

// ── Example 1: spec example ──────────────────────────────────────────────────
console.log('=== Example 1: notEquals (from spec) ===');
{
  const model = createModel();
  const a = model.variable('a', domain.from([1, 2]));
  const b = model.variable('b', domain.from([1, 2]));

  model.add(notEquals(a, b));

  const result = solve(model);
  console.log('status     :', result.status);
  console.log('assignments:', result.assignments);
  console.log('score      :', result.score);
}

// ── Example 2: allDifferent ──────────────────────────────────────────────────
console.log('\n=== Example 2: allDifferent ===');
{
  const model = createModel();
  const x = model.variable('x', domain.from([1, 2, 3]));
  const y = model.variable('y', domain.from([1, 2, 3]));
  const z = model.variable('z', domain.from([1, 2, 3]));

  model.add(allDifferent([x, y, z]));

  const result = solve(model);
  console.log('status     :', result.status);
  console.log('assignments:', result.assignments);
}

// ── Example 3: soft constraints (prefer) ─────────────────────────────────────
console.log('\n=== Example 3: prefer (soft constraints) ===');
{
  const model = createModel();
  const a = model.variable('a', domain.from([1, 2, 3]));
  const b = model.variable('b', domain.from([1, 2, 3]));

  model.add(notEquals(a, b));
  model.add(prefer(a, (v) => v === 3, 5));   // prefer a = 3, penalty 5 otherwise
  model.add(prefer(b, (v) => v === 1, 3));   // prefer b = 1, penalty 3 otherwise

  const result = solve(model);
  console.log('status     :', result.status);
  console.log('assignments:', result.assignments);
  console.log('score      :', result.score);
  console.log('violations :', result.violations);
}

// ── Example 4: infeasible ────────────────────────────────────────────────────
console.log('\n=== Example 4: infeasible ===');
{
  const model = createModel();
  const a = model.variable('a', domain.from([1]));
  const b = model.variable('b', domain.from([1]));

  model.add(notEquals(a, b)); // impossible — only value is 1 for both

  const result = solve(model);
  console.log('status     :', result.status);
}
