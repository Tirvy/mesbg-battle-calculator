import type { BattleInput } from '../../src/lib/types'

// ranged wounds with different shoot values and strength
export const input: BattleInput = {
  good: [{ Fv: 3, S: 4, D: 4, A: 1, twoHanded: false, Sv: 5, SS: 2 }],
  evil: [{ Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 3, SS: 3 }],
}

export const expected = {
  good: { rangedWound: 0.166, rangedHitAndWound: 0.055 },
  evil: { rangedWound: 0.33, rangedHitAndWound: 0.22 },
}

export const tolerance = 0.05
