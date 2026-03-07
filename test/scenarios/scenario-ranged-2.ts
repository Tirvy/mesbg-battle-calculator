import type { BattleInput } from '../../src/lib/types'

// ranged wounds with 4+|3+ shoot value
export const input: BattleInput = {
  good: [{ Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
  evil: [{ Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 3, SS: 2 }],
}

export const expected = {
  good: { rangedWound: 0.166, rangedHitAndWound: 0.083 },
  evil: { rangedWound: 0.166, rangedHitAndWound: 0.111 },
}

export const tolerance = 0.05
