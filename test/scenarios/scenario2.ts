import type { BattleInput } from '../../src/lib/types'

// Fv differernce
export const input: BattleInput = {
  good: [{ Fv: 4, S: 4, D: 9, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
  evil: [{ Fv: 3, S: 2, D: 6, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
}

export const expected = {
  good: { duelWin: 0.583 },
  evil: { duelWin: 0.416 },
}

export const tolerance = 0.05
