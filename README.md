```
   _____                _             
  / ____|              | |            
 | |     ___  _ __  ___| |_ _ __ __ _ 
 | |    / _ \| '_ \/ __| __| '__/ _` |
 | |___| (_) | | | \__ \ |_| | | (_| |
  \_____\___/|_| |_|___/\__|_|  \__,_|
```
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

TypeScript constraint solver for scheduling and allocation problems.

## Project Status
![Status](https://img.shields.io/badge/STATUS-IN_DEVELOPMENT-orange?style=for-the-badge)
![Current Version](https://img.shields.io/badge/CURRENT_VERSION-V.0.1-orange?style=for-the-badge)

## Example

```ts
import { createModel, domain, solve } from "@janjakubowski/constra";
import { noOverlap } from "@janjakubowski/constra/stdlib";

const model = createModel();

const a = model.variable("a", domain.from([1, 2]));
const b = model.variable("b", domain.from([1, 2]));

model.add(noOverlap([a, b]));

const result = solve(model);
````

## Authors

* [@HeroJJ555](https://www.github.com/HeroJJ555)

## Status

Early development (v0.1)

## License

MIT