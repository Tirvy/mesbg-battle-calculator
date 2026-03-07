import type { BattleInput } from '../../src/lib/types'

// ranged wounds with 4+|3+ to wound
export const input: BattleInput = {
  good: [{ Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
  evil: [{ Fv: 3, S: 4, D: 4, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
}

export const expected = {
  good: { rangedWound: 0.33 },
  evil: { rangedWound: 0.166 },
}

export const tolerance = 0.05
