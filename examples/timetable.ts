// School Timetable — Constra v0.3 example
//
// Schedules 3 subjects across 4 slots and assigns one of 3 teachers each.
// Demonstrates: hard constraints, soft preferences, notIn, ifThen, solve options, stats.

import { createModel, domain } from '@constra/core';
import { allDifferent, prefer, exactlyOne, atMostOne, notIn, ifThen, notEquals } from '@constra/stdlib';
import { solve } from '@constra/solver-backtracking';

const SLOTS = ['T1', 'T2', 'T3', 'T4'] as const;
const TEACHERS = ['alice', 'bob', 'carol'] as const;

const model = createModel();

const mathSlot    = model.variable('math_slot',    domain.from([...SLOTS]));
const englishSlot = model.variable('english_slot', domain.from([...SLOTS]));
const scienceSlot = model.variable('science_slot', domain.from([...SLOTS]));

const mathTeacher    = model.variable('math_teacher',    domain.from([...TEACHERS]));
const englishTeacher = model.variable('english_teacher', domain.from([...TEACHERS]));
const scienceTeacher = model.variable('science_teacher', domain.from([...TEACHERS]));

model.add(allDifferent([mathSlot, englishSlot, scienceSlot]));
model.add(allDifferent([mathTeacher, englishTeacher, scienceTeacher]));
model.add(exactlyOne([mathSlot, englishSlot, scienceSlot], (s) => s === 'T1'));
model.add(atMostOne([mathSlot, englishSlot, scienceSlot],  (s) => s === 'T4'));

// Science must not be scheduled in the first slot.
model.add(notIn(scienceSlot, ['T1']));

// If math is placed in the last slot (T4), english must not be in T3 either —
// demonstrated with ifThen: condition = "englishSlot ≠ mathSlot" (always true here
// due to allDifferent, so instead we use a concrete scheduling rule):
// If science is in T3, math must not be in T4.
model.add(ifThen(
  notIn(scienceSlot, ['T1', 'T2', 'T4']), // condition: science is in T3
  notIn(mathSlot, ['T4']),                 // consequence: math must not be in T4
));

model.add(prefer(mathTeacher,    (t) => t === 'alice', 3));
model.add(prefer(scienceTeacher, (t) => t === 'carol', 3));
model.add(prefer(englishSlot,    (s) => s === 'T1' || s === 'T2', 2));

const result = solve(model, { debug: true });

const pad = (s: string, n: number) => s.padEnd(n);

console.log('╔══════════════════════════════╗');
console.log('║    School Timetable v0.3     ║');
console.log('╚══════════════════════════════╝\n');
console.log(`status : ${result.status}`);

if (result.status === 'feasible') {
  const a = result.assignments;
  console.log('\n┌─────────────┬──────┬─────────┐');
  console.log('│ Subject     │ Slot │ Teacher │');
  console.log('├─────────────┼──────┼─────────┤');
  console.log(`│ ${pad('Math', 11)} │ ${pad(String(a['math_slot']), 4)} │ ${pad(String(a['math_teacher']), 7)} │`);
  console.log(`│ ${pad('English', 11)} │ ${pad(String(a['english_slot']), 4)} │ ${pad(String(a['english_teacher']), 7)} │`);
  console.log(`│ ${pad('Science', 11)} │ ${pad(String(a['science_slot']), 4)} │ ${pad(String(a['science_teacher']), 7)} │`);
  console.log('└─────────────┴──────┴─────────┘');

  console.log(`\nscore : ${result.score} (lower is better)`);

  if (result.violations.length > 0) {
    console.log('\npreference violations:');
    for (const v of result.violations) {
      console.log(`  • [${v.constraintId}] penalty=${v.penalty}${v.reason ? ` — ${v.reason}` : ''}`);
    }
  } else {
    console.log('\nAll preferences satisfied.');
  }
}

if (result.stats) {
  const s = result.stats;
  console.log('\n── solver stats ─────────────────');
  console.log(`  steps            : ${s.steps}`);
  console.log(`  backtracks       : ${s.backtracks}`);
  console.log(`  solutions checked: ${s.solutionsChecked}`);
  console.log(`  elapsed          : ${s.elapsedMs}ms`);
}

if (result.debug) {
  console.log('\n── debug ────────────────────────');
  console.log(`  MRV order : ${result.debug.mrvOrder.join(' → ')}`);
  console.log(`  dead ends : ${result.debug.deadEnds}`);
}


