import type { BattleInput, EngineResult } from './types'
import {
  makeEmptyProb,
  perDieDist,
  computeToWound,
  computeToWoundHard,
  perDieWoundProb,
} from './engine-common'

// Simple xorshift32 PRNG for optional reproducibility
function xorshift32(seed: number) {
  let x = seed >>> 0
  return function () {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x >>>= 0
    x ^= x << 5
    x >>>= 0
    return x / 0xffffffff
  }
}

export async function runMonteCarlo(
  input: BattleInput,
  iterations = 100000,
  seed?: number
): Promise<EngineResult> {
  const rng = seed == null ? Math.random : xorshift32(seed)

  const t0 = (globalThis as any).performance.now()

  // Precompute unit info arrays to avoid allocations inside loop
  const goodUnits = input.good.map(u => ({
    unit: u,
    pd: perDieDist(u),
    A: Math.max(0, Math.floor(u.A)),
  }))
  const evilUnits = input.evil.map(u => ({
    unit: u,
    pd: perDieDist(u),
    A: Math.max(0, Math.floor(u.A)),
  }))

  let duelGood = 0
  let duelEvil = 0
  let goodAtLeast1 = 0
  let goodAtLeast2 = 0
  let goodAtLeast3 = 0
  let evilAtLeast1 = 0
  let evilAtLeast2 = 0
  let evilAtLeast3 = 0

  // counters for single-attack and ranged probabilities
  let goodTotalWounds = 0
  let evilTotalWounds = 0
  let goodTotalAttackDice = 0
  let evilTotalAttackDice = 0
  let goodRangedWounds = 0
  let evilRangedWounds = 0
  let goodRangedDice = 0
  let evilRangedDice = 0
  // melee-only counters
  let goodMeleeWounds = 0
  let evilMeleeWounds = 0
  let goodMeleeDice = 0
  let evilMeleeDice = 0

  for (let it = 0; it < iterations; it++) {
    // simulate good side dice
    let goodMax = 0
    let goodMaxFv = -Infinity
    const goodWoundsRolls: number[] = []
    for (const g of goodUnits) {
      const { unit, pd, A } = g
      goodTotalAttackDice += A
      if (unit.ranged) {
        goodRangedDice += A
      } else {
        goodMeleeDice += A
      }
      let unitWounds = 0
      // track melee wounds separately for this unit
      let unitMeleeWounds = 0
      for (let a = 0; a < A; a++) {
        const r = rng()
        let acc = 0
        let v = 1
        for (; v <= 6; v++) {
          acc += pd[v]
          if (r <= acc) break
        }
        if (v > 6) v = 6
        if (v > goodMax) {
          goodMax = v
          goodMaxFv = unit.Fv
        } else if (v === goodMax) {
          if (unit.Fv > goodMaxFv) goodMaxFv = unit.Fv
        }
        // wound logic
        let attackerS = unit.S
        let hit = true
        if (unit.ranged) {
          hit = v >= unit.Sv
          attackerS = unit.SS
        }
        if (hit) {
          const { raw, toWound, hard } = computeToWound(attackerS, input.evil.length > 0 ? input.evil[0].D : 0)
          if (!hard) {
            if (v >= toWound) {
              unitWounds++
                if (!unit.ranged) unitMeleeWounds++
            }
          } else {
            if (v >= 6) {
              const r2 = rng()
              const pd2 = perDieDist(unit)
              let acc2 = 0
              let v2 = 1
              for (; v2 <= 6; v2++) {
                acc2 += pd2[v2]
                if (r2 <= acc2) break
              }
              const toWoundHard = computeToWoundHard(attackerS, input.evil.length > 0 ? input.evil[0].D : 0)
              if (v2 >= toWoundHard) {
                unitWounds++
                    if (!unit.ranged) unitMeleeWounds++
              }
            }
          }
        }
      }
      goodWoundsRolls.push(unitWounds)
      goodTotalWounds += unitWounds
      if (!unit.ranged) goodMeleeWounds += unitMeleeWounds
      if (unit.ranged) goodRangedWounds += unitWounds
    }

    // evil side
    let evilMax = 0
    let evilMaxFv = -Infinity
    const evilWoundsRolls: number[] = []
    for (const g of evilUnits) {
      const { unit, pd, A } = g
      evilTotalAttackDice += A
      if (unit.ranged) evilRangedDice += A
      else evilMeleeDice += A
      let unitWounds = 0
      let unitMeleeWounds = 0
      for (let a = 0; a < A; a++) {
        const r = rng()
        let acc = 0
        let v = 1
        for (; v <= 6; v++) {
          acc += pd[v]
          if (r <= acc) break
        }
        if (v > 6) v = 6
        if (v > evilMax) {
          evilMax = v
          evilMaxFv = unit.Fv
        } else if (v === evilMax) {
          if (unit.Fv > evilMaxFv) evilMaxFv = unit.Fv
        }
        let attackerS = unit.S
        let hit = true
        if (unit.ranged) {
          hit = v >= unit.Sv
          attackerS = unit.SS
        }
        if (hit) {
          const { raw, toWound, hard } = computeToWound(attackerS, input.good.length > 0 ? input.good[0].D : 0)
          if (!hard) {
            if (v >= toWound) {
              unitWounds++
              if (!unit.ranged) unitMeleeWounds++
            }
          } else {
            if (v >= 6) {
              const r2 = rng()
              const pd2 = perDieDist(unit)
              let acc2 = 0
              let v2 = 1
              for (; v2 <= 6; v2++) {
                acc2 += pd2[v2]
                if (r2 <= acc2) break
              }
              const toWoundHard = computeToWoundHard(attackerS, input.good.length > 0 ? input.good[0].D : 0)
              if (v2 >= toWoundHard) unitWounds++
                if (v2 >= toWoundHard) {
                  unitWounds++
                  if (!unit.ranged) unitMeleeWounds++
                }
            }
          }
          // melee wounds already accounted above
        }
      }
      evilWoundsRolls.push(unitWounds)
      evilTotalWounds += unitWounds
      if (!unit.ranged) evilMeleeWounds += unitMeleeWounds
      if (unit.ranged) evilRangedWounds += unitWounds
    }

    // determine duel winner
    let goodWin = false
    let evilWin = false
    if (goodMax > evilMax) goodWin = true
    else if (goodMax < evilMax) evilWin = true
    else {
      if (goodMaxFv > evilMaxFv) goodWin = true
      else if (goodMaxFv < evilMaxFv) evilWin = true
      else {
        if (rng() < 0.5) goodWin = true
        else evilWin = true
      }
    }

    if (goodWin) {
      duelGood++
      const totalWounds = goodWoundsRolls.reduce((s, x) => s + x, 0)
      const meleeWounds = goodWoundsRolls.reduce((s,x,i)=> s + (goodUnits[i].unit.ranged?0:x),0)
      if (meleeWounds >= 1) goodAtLeast1++
      if (meleeWounds >= 2) goodAtLeast2++
      if (meleeWounds >= 3) goodAtLeast3++
    } else {
      duelEvil++
      const totalWounds = evilWoundsRolls.reduce((s, x) => s + x, 0)
      const meleeWounds = evilWoundsRolls.reduce((s,x,i)=> s + (evilUnits[i].unit.ranged?0:x),0)
      if (meleeWounds >= 1) evilAtLeast1++
      if (meleeWounds >= 2) evilAtLeast2++
      if (meleeWounds >= 3) evilAtLeast3++
    }
  }

  const t1 = (globalThis as any).performance.now()

  const probabilities = makeEmptyProb()
  probabilities.duelGoodWin = duelGood / iterations
  probabilities.duelEvilWin = duelEvil / iterations
  probabilities.pAtLeast1Good = goodAtLeast1 / iterations
  probabilities.pAtLeast2Good = goodAtLeast2 / iterations
  probabilities.pAtLeast3Good = goodAtLeast3 / iterations
  probabilities.pAtLeast1Evil = evilAtLeast1 / iterations
  probabilities.pAtLeast2Evil = evilAtLeast2 / iterations
  probabilities.pAtLeast3Evil = evilAtLeast3 / iterations

  probabilities.pSingleAttackWoundGood = goodMeleeDice > 0 ? goodMeleeWounds / goodMeleeDice : 0
  probabilities.pSingleAttackWoundEvil = evilMeleeDice > 0 ? evilMeleeWounds / evilMeleeDice : 0

  probabilities.rangedWoundGood = goodRangedDice > 0 ? goodRangedWounds / goodRangedDice : 0
  probabilities.rangedWoundEvil = evilRangedDice > 0 ? evilRangedWounds / evilRangedDice : 0

  return {
    computationTimeMs: t1 - t0,
    mode: 'Fast',
    probabilities,
  }
}
