import { describe, it, expect } from 'vitest'
import { runMonteCarlo, runExact } from '../src/lib/engine'
import * as s1 from './scenarios/scenario1'
import * as s2 from './scenarios/scenario2'
import * as s3 from './scenarios/scenario3'
import * as s4 from './scenarios/scenario4'
import * as s5 from './scenarios/scenario5'
import * as sR1 from './scenarios/scenario-ranged-1'
import * as sR2 from './scenarios/scenario-ranged-2'
import * as sR3 from './scenarios/scenario-ranged-3'

const scenarios = [
  { file: 'scenario1.ts', s: s1 },
  { file: 'scenario2.ts', s: s2 },
  { file: 'scenario3.ts', s: s3 },
  { file: 'scenario5.ts', s: s5 },
  { file: 'scenario-ranged-1.ts', s: sR1 },
  { file: 'scenario-ranged-2.ts', s: sR2 },
  { file: 'scenario-ranged-3.ts', s: sR3 },
]

describe('Engine scaffold tests', () => {
  it('Monte Carlo returns structure and within tolerance for simple scenarios', async () => {
    for (const { file, s } of scenarios) {
      try {
        const mc = await runMonteCarlo(s.input, 2000, 12345)
        // Validate basic shape and compare to expected within tolerance
        for (const [key, value] of Object.entries(s.expected.good)) {
          const actual = (mc.probabilities.good as any)[key] ?? 0
          expect(Math.abs(actual - value)).toBeLessThanOrEqual(s.tolerance)
        }
        for (const [key, value] of Object.entries(s.expected.evil)) {
          const actual = (mc.probabilities.evil as any)[key] ?? 0
          expect(Math.abs(actual - value)).toBeLessThanOrEqual(s.tolerance)
        }
      } catch (e) {
        console.error(`Failed scenario file: ${file}`)
        throw e
      }
    }
  })

  it('Exact runs for small scenarios', async () => {
    for (const { file, s } of scenarios) {
      try {
        const ex = await runExact(s.input)
        expect(ex.mode).toBe('Exact')
        // Compare to expected within tolerance
        for (const [key, value] of Object.entries(s.expected.good)) {
          const actual = (ex.probabilities.good as any)[key] ?? 0
          expect(Math.abs(actual - value)).toBeLessThanOrEqual(s.tolerance)
        }
        for (const [key, value] of Object.entries(s.expected.evil)) {
          const actual = (ex.probabilities.evil as any)[key] ?? 0
          expect(Math.abs(actual - value)).toBeLessThanOrEqual(s.tolerance)
        }
      } catch (e) {
        console.error(`Failed scenario file: ${file}`)
        throw e
      }
    }
  })

  it('Exact rejects scenarios with >15 total attacks', async () => {
    await expect(async () => {
      await runExact(s4.input)
    }).rejects.toThrow('Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode.')
  })
})
