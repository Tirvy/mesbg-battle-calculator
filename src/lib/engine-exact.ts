import type { BattleInput, EngineResult, Probabilities, Unit } from './types'
import {
  totalAttacks,
  makeEmptyProb,
  computeToWound,
  computeToWoundHard,
  buildSidePMF,
  perDieWoundProb,
} from './engine-common'

export async function runExact(input: BattleInput): Promise<EngineResult> {
  const total = totalAttacks(input)
  if (total > 15) {
    throw new Error(
      'Exact mode disabled: more than 15 total attacks would result in excessive computation time. Please use Fast mode.'
    )
  }

  const t0 = (globalThis as any).performance.now()

  const probabilities = makeEmptyProb()

  const defenderDforGood = input.evil.length > 0 ? input.evil[0].D : 0
  const defenderDforEvil = input.good.length > 0 ? input.good[0].D : 0

  const pmfGood = buildSidePMF(input.good, defenderDforGood, false)
  const pmfEvil = buildSidePMF(input.evil, defenderDforEvil, false)

  let duelGood = 0
  let duelEvil = 0
  let goodAtLeast1 = 0
  let goodAtLeast2 = 0
  let goodAtLeast3 = 0
  let evilAtLeast1 = 0
  let evilAtLeast2 = 0
  let evilAtLeast3 = 0

  for (let k1 = 1; k1 <= 6; k1++) {
    const map1 = pmfGood[k1 - 1]
    for (const [f1, rec1] of map1.entries()) {
      for (let k2 = 1; k2 <= 6; k2++) {
        const map2 = pmfEvil[k2 - 1]
        for (const [f2, rec2] of map2.entries()) {
          const mass = rec1.prob * rec2.prob
          if (mass === 0) continue

          let goodWinMass = 0
          let evilWinMass = 0
          if (k1 > k2) goodWinMass = mass
          else if (k1 < k2) evilWinMass = mass
          else {
            if (f1 > f2) goodWinMass = mass
            else if (f1 < f2) evilWinMass = mass
            else {
              goodWinMass = mass * 0.5
              evilWinMass = mass * 0.5
            }
          }

          duelGood += goodWinMass
          duelEvil += evilWinMass

          const distGood = rec1.wounds
          const distEvil = rec2.wounds

          if (goodWinMass > 0) {
            const pAtLeast1 = distGood.slice(1).reduce((s, a) => s + a, 0)
            const pAtLeast2 = distGood.slice(2).reduce((s, a) => s + a, 0)
            const pAtLeast3 = distGood.slice(3).reduce((s, a) => s + a, 0)
            goodAtLeast1 += goodWinMass * (pAtLeast1 / rec1.prob)
            goodAtLeast2 += goodWinMass * (pAtLeast2 / rec1.prob)
            goodAtLeast3 += goodWinMass * (pAtLeast3 / rec1.prob)
          }

          if (evilWinMass > 0) {
            const pAtLeast1 = distEvil.slice(1).reduce((s, a) => s + a, 0)
            const pAtLeast2 = distEvil.slice(2).reduce((s, a) => s + a, 0)
            const pAtLeast3 = distEvil.slice(3).reduce((s, a) => s + a, 0)
            evilAtLeast1 += evilWinMass * (pAtLeast1 / rec2.prob)
            evilAtLeast2 += evilWinMass * (pAtLeast2 / rec2.prob)
            evilAtLeast3 += evilWinMass * (pAtLeast3 / rec2.prob)
          }
        }
      }
    }
  }

  probabilities.good.duelWin = duelGood
  probabilities.evil.duelWin = duelEvil
  probabilities.good.pAtLeast1Wound = goodAtLeast1
  probabilities.good.pAtLeast2Wounds = goodAtLeast2
  probabilities.good.pAtLeast3Wounds = goodAtLeast3
  probabilities.evil.pAtLeast1Wound = evilAtLeast1
  probabilities.evil.pAtLeast2Wounds = evilAtLeast2
  probabilities.evil.pAtLeast3Wounds = evilAtLeast3

  const totalGoodAttacks = input.good.reduce((s, u) => s + Math.max(0, Math.floor(u.A)), 0)
  const totalEvilAttacks = input.evil.reduce((s, u) => s + Math.max(0, Math.floor(u.A)), 0)
  let sumGoodPerDie = 0
  for (const u of input.good) sumGoodPerDie += perDieWoundProb(u, defenderDforGood, { ranged: false })
  let sumEvilPerDie = 0
  for (const u of input.evil) sumEvilPerDie += perDieWoundProb(u, defenderDforEvil, { ranged: false })
  probabilities.good.pSingleAttackWound = totalGoodAttacks > 0 ? sumGoodPerDie / input.good.length : 0
  probabilities.evil.pSingleAttackWound = totalEvilAttacks > 0 ? sumEvilPerDie / input.evil.length : 0

  let rangedGood = 0
  let rangedEvil = 0
  for (const u of input.good) rangedGood += perDieWoundProb(u, defenderDforGood, { ranged: true })
  for (const u of input.evil) rangedEvil += perDieWoundProb(u, defenderDforEvil, { ranged: true })
  probabilities.good.rangedWound = rangedGood
  probabilities.evil.rangedWound = rangedEvil

  // rangedHitAndWound: P(hit) × P(wound|hit) for each unit
  // P(hit) = (7 - Sv) / 6 (probability of rolling >= Sv on d6)
  let hitAndWoundGood = 0
  let hitAndWoundEvil = 0
  for (const u of input.good) {
    const pHit = Math.max(0, Math.min(6, 7 - u.Sv)) / 6
    hitAndWoundGood += pHit * perDieWoundProb(u, defenderDforGood, { ranged: true })
  }
  for (const u of input.evil) {
    const pHit = Math.max(0, Math.min(6, 7 - u.Sv)) / 6
    hitAndWoundEvil += pHit * perDieWoundProb(u, defenderDforEvil, { ranged: true })
  }
  probabilities.good.rangedHitAndWound = hitAndWoundGood
  probabilities.evil.rangedHitAndWound = hitAndWoundEvil

  const t1 = (globalThis as any).performance.now()
  return {
    computationTimeMs: t1 - t0,
    mode: 'Exact',
    probabilities,
  }
}
