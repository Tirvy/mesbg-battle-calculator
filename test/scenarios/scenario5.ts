import type { BattleInput } from '../../src/lib/types'

// 2 attacks on one side, 1 on the other, plus fv diffeerence
export const input: BattleInput = {
  good: [{ Fv: 3, S: 4, D: 5, A: 2, twoHanded: false, Sv: 4, SS: 2 }],
  evil: [{ Fv: 4, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
}

export const expected = {
  duelGoodWin: 0.582,
  duelEvilWin: 0.417,
}

export const tolerance = 0.05
