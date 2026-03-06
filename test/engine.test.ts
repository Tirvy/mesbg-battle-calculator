import { describe, it, expect } from 'vitest'
import { runMonteCarlo, runExact } from '../src/lib/engine'
import * as s1 from './scenarios/scenario1'
import * as s2 from './scenarios/scenario2'
import * as s3 from './scenarios/scenario3'
import * as s4 from './scenarios/scenario4'
import * as s5 from './scenarios/scenario5'

const scenarios = [s1, s2, s3, s5]

describe('Engine scaffold tests', () => {
  it('Monte Carlo returns structure and within tolerance for simple scenarios', async () => {
    for (const s of scenarios) {
      const mc = await runMonteCarlo(s.input, 2000, 12345)
      // Validate basic shape
      expect(mc.probabilities.good).toHaveProperty('duelWin')
      expect(mc.probabilities.evil).toHaveProperty('duelWin')

      // Compare to expected within tolerance
      expect(Math.abs((mc.probabilities.good.duelWin ?? 0) - s.expected.good.duelWin)).toBeLessThanOrEqual(s.tolerance)
      expect(Math.abs((mc.probabilities.evil.duelWin ?? 0) - s.expected.evil.duelWin)).toBeLessThanOrEqual(s.tolerance)
    }
  })

  it('Exact runs for small scenarios', async () => {
    for (const s of scenarios) {
      const ex = await runExact(s.input)
      expect(ex.mode).toBe('Exact')
      expect(ex.probabilities.good).toHaveProperty('duelWin')
      expect(ex.probabilities.evil).toHaveProperty('duelWin')

      // Compare to expected within tolerance
      expect(Math.abs((ex.probabilities.good.duelWin ?? 0) - s.expected.good.duelWin)).toBeLessThanOrEqual(s.tolerance)
      expect(Math.abs((ex.probabilities.evil.duelWin ?? 0) - s.expected.evil.duelWin)).toBeLessThanOrEqual(s.tolerance)
    }
  })

  it('Exact rejects scenarios with >15 total attacks', async () => {
    await expect(async () => {
      await runExact(s4.input)
    }).rejects.toThrow('Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode.')
  })
})
