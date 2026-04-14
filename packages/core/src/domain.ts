export interface Domain<T = unknown> {
  readonly values: readonly T[];
}

export const domain = {
  from<T>(values: T[]): Domain<T> {
    return { values: [...values] };
  },
};
