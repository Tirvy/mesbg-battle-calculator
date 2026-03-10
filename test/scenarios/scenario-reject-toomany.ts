import type { BattleInput } from '../../src/lib/types'

// Scenario with many attacks to trigger Exact rejection
export const input: BattleInput = {
  good: new Array(10).fill(0).map(() => ({ Fv: 4, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 })),
  evil: new Array(6).fill(0).map(() => ({ Fv: 4, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 })),
}

export const expected = null // Exact should be rejected; Fast will still run

export const tolerance = 0.0
