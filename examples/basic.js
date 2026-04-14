"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@constra/core");
const stdlib_1 = require("@constra/stdlib");
const solver_backtracking_1 = require("@constra/solver-backtracking");
// ── Example 1: spec example ──────────────────────────────────────────────────
console.log('=== Example 1: notEquals (from spec) ===');
{
    const model = (0, core_1.createModel)();
    const a = model.variable('a', core_1.domain.from([1, 2]));
    const b = model.variable('b', core_1.domain.from([1, 2]));
    model.add((0, stdlib_1.notEquals)(a, b));
    const result = (0, solver_backtracking_1.solve)(model);
    console.log('status     :', result.status);
    console.log('assignments:', result.assignments);
    console.log('score      :', result.score);
}
// ── Example 2: allDifferent ──────────────────────────────────────────────────
console.log('\n=== Example 2: allDifferent ===');
{
    const model = (0, core_1.createModel)();
    const x = model.variable('x', core_1.domain.from([1, 2, 3]));
    const y = model.variable('y', core_1.domain.from([1, 2, 3]));
    const z = model.variable('z', core_1.domain.from([1, 2, 3]));
    model.add((0, stdlib_1.allDifferent)([x, y, z]));
    const result = (0, solver_backtracking_1.solve)(model);
    console.log('status     :', result.status);
    console.log('assignments:', result.assignments);
}
// ── Example 3: soft constraints (prefer) ─────────────────────────────────────
console.log('\n=== Example 3: prefer (soft constraints) ===');
{
    const model = (0, core_1.createModel)();
    const a = model.variable('a', core_1.domain.from([1, 2, 3]));
    const b = model.variable('b', core_1.domain.from([1, 2, 3]));
    model.add((0, stdlib_1.notEquals)(a, b));
    model.add((0, stdlib_1.prefer)(a, (v) => v === 3, 5)); // prefer a = 3, penalty 5 otherwise
    model.add((0, stdlib_1.prefer)(b, (v) => v === 1, 3)); // prefer b = 1, penalty 3 otherwise
    const result = (0, solver_backtracking_1.solve)(model);
    console.log('status     :', result.status);
    console.log('assignments:', result.assignments);
    console.log('score      :', result.score);
    console.log('violations :', result.violations);
}
// ── Example 4: infeasible ────────────────────────────────────────────────────
console.log('\n=== Example 4: infeasible ===');
{
    const model = (0, core_1.createModel)();
    const a = model.variable('a', core_1.domain.from([1]));
    const b = model.variable('b', core_1.domain.from([1]));
    model.add((0, stdlib_1.notEquals)(a, b)); // impossible — only value is 1 for both
    const result = (0, solver_backtracking_1.solve)(model);
    console.log('status     :', result.status);
}
