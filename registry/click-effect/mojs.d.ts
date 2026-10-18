/**
 * Minimal ambient typings for `@mojs/core` (v1.3.0), which ships no
 * declaration file of its own. Only the surface this registry uses is typed:
 * the `Burst` and `Shape` constructors and the `tune` / `generate` /
 * `replay` chain. Options are permissive because mo.js accepts deeply nested
 * delta objects (`radius: { 10: 30 }`, `children: { … }`, …) that this
 * declaration does not attempt to model exhaustively.
 */
declare module '@mojs/core' {
  export interface MojsOptions {
    [key: string]: unknown
  }

  export class Burst {
    constructor(options?: MojsOptions)
    tune(properties: MojsOptions): this
    generate(): this
    replay(): this
  }

  export class Shape {
    constructor(options?: MojsOptions)
    tune(properties: MojsOptions): this
    generate(): this
    replay(): this
  }

  interface Mojs {
    Burst: typeof Burst
    Shape: typeof Shape
  }

  const mojs: Mojs
  export default mojs
}
