import type { BattleInput } from '../../src/lib/types'

// two-handed vs one-handed
export const input: BattleInput = {
  good: [
    { Fv: 4, S: 5, D: 6, A: 1, twoHanded: true, Sv: 4, SS: 2 },
  ],
  evil: [
    { Fv: 4, S: 5, D: 6, A: 1, twoHanded: false, Sv: 4, SS: 2 },
  ],
}

export const expected = {
  good: { duelWin: 0.361 },
  evil: { duelWin: 0.638 },
}

export const tolerance = 0.05
