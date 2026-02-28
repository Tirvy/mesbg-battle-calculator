export type Unit = {
  Fv: number
  S: number
  D: number
  A: number
  twoHanded: boolean
  Sv: number
  SS: number
  ranged?: boolean
}

export type BattleInput = {
  good: Unit[]
  evil: Unit[]
}

export type Probabilities = {
  duelGoodWin: number
  duelEvilWin: number
  pSingleAttackWoundGood?: number
  pSingleAttackWoundEvil?: number
  pAtLeast1Good?: number
  pAtLeast2Good?: number
  pAtLeast3Good?: number
  pAtLeast1Evil?: number
  pAtLeast2Evil?: number
  pAtLeast3Evil?: number
  rangedWoundGood?: number
  rangedWoundEvil?: number
}

export type EngineResult = {
  computationTimeMs: number
  mode: 'Fast' | 'Exact'
  probabilities: Probabilities
}
