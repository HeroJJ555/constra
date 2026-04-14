```
   _____                _             
  / ____|              | |            
 | |     ___  _ __  ___| |_ _ __ __ _ 
 | |    / _ \| '_ \/ __| __| '__/ _` |
 | |___| (_) | | | \__ \ |_| | | (_| |
  \_____\___/|_| |_|___/\__|_|  \__,_|
```
TypeScript constraint solver for scheduling and allocation problems.

<p align="left">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/status-in--development-orange?style=for-the-badge" />
  <img src="https://img.shields.io/npm/v/@herojj555/constra?style=for-the-badge" />
</p>

---

Constra is a lightweight constraint solver for TypeScript, designed to model and solve real-world problems like scheduling, timetables, and resource allocation.

It focuses on:
- clean and readable API
- deterministic solving
- explainable results (not just answers)

---

## Example

```ts
import { createModel, domain, solve } from "@herojj555/constra";
import { noOverlap } from "@herojj555/constra/stdlib";

const model = createModel();

const a = model.variable("a", domain.from([1, 2]));
const b = model.variable("b", domain.from([1, 2]));

model.add(noOverlap([a, b]));

const result = solve(model);

console.log(result);
````

---

## What it can do

* define decision variables with finite domains
* express constraints (`allDifferent`, `atMostOne`, `exactlyOne`, etc.)
* combine hard and soft constraints
* solve using backtracking + MRV heuristic
* return **explainable results** (violations, penalties, reasoning)

---

## Project Status

Early development - API may change.

Constra is evolving into a practical scheduling engine for TypeScript, not just a theoretical CSP tool.

---

## Author

* [@HeroJJ555](https://www.github.com/HeroJJ555)

---

## License

Mozilla Public License Version 2.0
