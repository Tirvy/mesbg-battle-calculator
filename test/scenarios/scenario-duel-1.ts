import type { BattleInput } from '../../src/lib/types'

export const input: BattleInput = {
  good: [{ Fv: 4, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
  evil: [{ Fv: 4, S: 4, D: 5, A: 1, twoHanded: false, Sv: 4, SS: 2 }],
}

export const expected = {
  good: { duelWin: 0.5 },
  evil: { duelWin: 0.5 },
}

export const tolerance = 0.05
