import type { Domain } from './domain';

export interface Variable<T = unknown> {
  readonly id: string;
  readonly domain: Domain<T>;
}
