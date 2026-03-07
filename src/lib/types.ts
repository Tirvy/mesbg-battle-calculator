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

export type PlayerProbabilities = {
  duelWin: number
  pSingleAttackWound?: number
  pAtLeast1Wound?: number
  pAtLeast2Wounds?: number
  pAtLeast3Wounds?: number
  rangedWound?: number
  rangedHitAndWound?: number
}

export type Probabilities = {
  good: PlayerProbabilities
  evil: PlayerProbabilities
}

export type EngineResult = {
  computationTimeMs: number
  mode: 'Fast' | 'Exact'
  probabilities: Probabilities
}
