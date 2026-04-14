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
  <img src="https://img.shields.io/badge/status-under--development-orange" />
  <img src="https://img.shields.io/badge/version-0.1.0--alpha-blue" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

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