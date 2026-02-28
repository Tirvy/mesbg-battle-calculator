import { describe, it, expect } from 'vitest'
import { runMonteCarlo, runExact } from '../src/lib/engine'
import * as s1 from './scenarios/scenario1'
import * as s2 from './scenarios/scenario2'
import * as s3 from './scenarios/scenario3'
import * as s4 from './scenarios/scenario4'

const scenarios = [s1, s2, s3]

describe('Engine scaffold tests', () => {
  it('Monte Carlo returns structure and within tolerance for simple scenarios', async () => {
    for (const s of scenarios) {
      const mc = await runMonteCarlo(s.input, 2000, 12345)
      // Validate basic shape
      expect(mc.probabilities).toHaveProperty('duelGoodWin')
      expect(mc.probabilities).toHaveProperty('duelEvilWin')

      // Compare to expected within tolerance
      expect(Math.abs((mc.probabilities.duelGoodWin ?? 0) - s.expected.duelGoodWin)).toBeLessThanOrEqual(s.tolerance)
      expect(Math.abs((mc.probabilities.duelEvilWin ?? 0) - s.expected.duelEvilWin)).toBeLessThanOrEqual(s.tolerance)
    }
  })

  it('Exact runs for small scenarios', async () => {
    for (const s of scenarios) {
      const ex = await runExact(s.input)
      expect(ex.mode).toBe('Exact')
      expect(ex.probabilities).toHaveProperty('duelGoodWin')
      expect(ex.probabilities).toHaveProperty('duelEvilWin')

      // Compare to expected within tolerance
      expect(Math.abs((ex.probabilities.duelGoodWin ?? 0) - s.expected.duelGoodWin)).toBeLessThanOrEqual(s.tolerance)
      expect(Math.abs((ex.probabilities.duelEvilWin ?? 0) - s.expected.duelEvilWin)).toBeLessThanOrEqual(s.tolerance)
    }
  })

  it('Exact rejects scenarios with >15 total attacks', async () => {
    await expect(async () => {
      await runExact(s4.input)
    }).rejects.toThrow('Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode.')
  })
})
