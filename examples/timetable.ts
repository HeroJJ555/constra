/**
 * School Timetable — Constra v0.2 example
 *
 * Scenario:
 *   A small school needs to schedule 3 subjects (Math, English, Science)
 *   across 4 available time slots (T1–T4) and assign one of 3 teachers
 *   (alice, bob, carol) to each subject.
 *
 * Hard constraints:
 *   - No two subjects may share the same time slot (allDifferent on slots)
 *   - No teacher may teach more than one subject (allDifferent on teachers)
 *   - Exactly one subject must open the day in slot T1 (exactlyOne)
 *   - At most one subject may be placed in the last slot T4 (atMostOne)
 *
 * Soft constraints (preferences):
 *   - Alice prefers to teach Math (penalty 3 if not)
 *   - Carol prefers to teach Science (penalty 3 if not)
 *   - English is better scheduled in the morning T1 or T2 (penalty 2 if not)
 */

import { createModel, domain } from '@constra/core';
import { allDifferent, prefer, exactlyOne, atMostOne } from '@constra/stdlib';
import { solve } from '@constra/solver-backtracking';

const SLOTS = ['T1', 'T2', 'T3', 'T4'] as const;
const TEACHERS = ['alice', 'bob', 'carol'] as const;

const model = createModel();

// ── Decision variables ────────────────────────────────────────────────────────
const mathSlot    = model.variable('math_slot',    domain.from([...SLOTS]));
const englishSlot = model.variable('english_slot', domain.from([...SLOTS]));
const scienceSlot = model.variable('science_slot', domain.from([...SLOTS]));

const mathTeacher    = model.variable('math_teacher',    domain.from([...TEACHERS]));
const englishTeacher = model.variable('english_teacher', domain.from([...TEACHERS]));
const scienceTeacher = model.variable('science_teacher', domain.from([...TEACHERS]));

// ── Hard constraints ──────────────────────────────────────────────────────────

// No two subjects at the same time.
model.add(allDifferent([mathSlot, englishSlot, scienceSlot]));

// Each teacher teaches exactly one subject.
model.add(allDifferent([mathTeacher, englishTeacher, scienceTeacher]));

// Exactly one subject must open the school day (slot T1).
model.add(exactlyOne([mathSlot, englishSlot, scienceSlot], (s) => s === 'T1'));

// At most one subject can be placed in the last slot T4 (limits late scheduling).
model.add(atMostOne([mathSlot, englishSlot, scienceSlot], (s) => s === 'T4'));

// ── Soft constraints (preferences) ───────────────────────────────────────────
model.add(prefer(mathTeacher,    (t) => t === 'alice', 3));
model.add(prefer(scienceTeacher, (t) => t === 'carol', 3));
model.add(prefer(englishSlot,    (s) => s === 'T1' || s === 'T2', 2));

// ── Solve ─────────────────────────────────────────────────────────────────────
const result = solve(model);

console.log('=== School Timetable ===\n');
console.log('status :', result.status);

if (result.status === 'feasible') {
  const { assignments: a } = result;
  console.log('\nTimetable:');
  console.log(`  Math    → slot ${a['math_slot']},    teacher: ${a['math_teacher']}`);
  console.log(`  English → slot ${a['english_slot']}, teacher: ${a['english_teacher']}`);
  console.log(`  Science → slot ${a['science_slot']}, teacher: ${a['science_teacher']}`);
  console.log(`\nscore      : ${result.score} (lower is better)`);
  if (result.violations.length > 0) {
    console.log('\npreference violations:');
    for (const v of result.violations) {
      console.log(`  [${v.constraintId}] penalty=${v.penalty}`);
      if (v.reason) console.log(`    reason: ${v.reason}`);
    }
  } else {
    console.log('\nAll preferences satisfied!');
  }
}
