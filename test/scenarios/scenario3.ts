import type { BattleInput } from '../../src/lib/types'

export const input: BattleInput = {
  good: [
    { Fv: 5, S: 5, D: 6, A: 2, twoHanded: true, Sv: 4, SS: 2 },
  ],
  evil: [
    { Fv: 4, S: 4, D: 5, A: 2, twoHanded: false, Sv: 4, SS: 2 },
  ],
}

export const expected = {
  duelGoodWin: 0.5,
  duelEvilWin: 0.5,
}

export const tolerance = 0.05
