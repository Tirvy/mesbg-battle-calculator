import { describe, it, expect } from 'vitest'
import { runMonteCarlo, runExact } from '../src/lib/engine'
import * as sD1 from './scenarios/scenario-duel-1'
import * as sD2 from './scenarios/scenario-duel-2'
import * as sD3 from './scenarios/scenario-duel-3'
import * as sD4 from './scenarios/scenario-duel-4'
import * as sD5 from './scenarios/scenario-duel-5'
import * as sD6 from './scenarios/scenario-duel-6'
import * as sreject1 from './scenarios/scenario-reject-toomany'
import * as sR1 from './scenarios/scenario-ranged-1'
import * as sR2 from './scenarios/scenario-ranged-2'
import * as sR3 from './scenarios/scenario-ranged-3'

const scenarios = [
  { file: 'scenario-duel-1.ts', s: sD1 },
  { file: 'scenario-duel-2.ts', s: sD2 },
  { file: 'scenario-duel-3.ts', s: sD3 },
  { file: 'scenario-duel-4.ts', s: sD4 },
  { file: 'scenario-duel-5.ts', s: sD5 },
  { file: 'scenario-duel-6.ts', s: sD6 },
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
      await runExact(sreject1.input)
    }).rejects.toThrow('Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode.')
  })
})
