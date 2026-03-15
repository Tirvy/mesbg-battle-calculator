import type { BattleInput } from '../../src/lib/types'

// 2 units on one side, one with two-handed weapon, 1 on the other
export const input: BattleInput = {
  good: [
    { Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 },
    { Fv: 3, S: 4, D: 5, A: 1, twoHanded: true, Sv: 4, SS: 2 }
  ],
  evil: [{ Fv: 3, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
}

export const expected = {
  good: { duelWin: 0.592 },
  evil: { duelWin: 0.408 },
}

export const tolerance = 0.05
