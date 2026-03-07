import type { BattleInput, EngineResult, Probabilities, Unit } from './types'

export function totalAttacks(input: BattleInput) {
  let sum = 0
  for (const u of input.good) sum += Math.max(0, Math.floor(u.A))
  for (const u of input.evil) sum += Math.max(0, Math.floor(u.A))
  return sum
}

export function makeEmptyProb(): Probabilities {
  return {
    good: { duelWin: 0 },
    evil: { duelWin: 0 },
  }
}

export function perDieDistDuel(unit: Unit) {
  const p = new Array(7).fill(0)
  if (unit.twoHanded) {
    p[1] = 2 / 6
    p[2] = 1 / 6
    p[3] = 1 / 6
    p[4] = 1 / 6
    p[5] = 1 / 6
    p[6] = 0
  } else {
    for (let v = 1; v <= 6; v++) p[v] = 1 / 6
  }
  return p
}

export function perDieDistWound(unit: Unit, ranged = false) {
  const p = new Array(7).fill(0)
  if (unit.twoHanded && !ranged) {
    p[1] = 0
    p[2] = 1 / 6
    p[3] = 1 / 6
    p[4] = 1 / 6
    p[5] = 1 / 6
    p[6] = 2 / 6
  } else {
    for (let v = 1; v <= 6; v++) p[v] = 1 / 6
  }
  return p
}

export function computeToWound(attackerS: number, defenderD: number) {
  const raw = Math.ceil((defenderD - attackerS) / 2) + 4
  const toWound = Math.max(3, Math.min(6, raw))
  const hard = raw > 6
  return { raw, toWound, hard }
}

export function computeToWoundHard(attackerS: number, defenderD: number) {
  let th = defenderD - attackerS - 1
  if (th < 3) th = 3
  return th
}

export function perDieWoundProb(unit: Unit, defenderFirstD: number, opts: { ranged?: boolean } = {}) {
  const attackerS = opts.ranged ? unit.SS : unit.S
  const pd = perDieDistWound(unit, opts.ranged)
  const { raw, toWound, hard } = computeToWound(attackerS, defenderFirstD)
  if (!hard) {
    let sum = 0
    for (let v = toWound; v <= 6; v++) sum += pd[v]
    return sum
  }
  const toWoundHard = computeToWoundHard(attackerS, defenderFirstD)
  const hardPd = perDieDistWound(unit, opts.ranged)
  let pHard = 0
  for (let v = toWoundHard; v <= 6; v++) pHard += hardPd[v]
  return pd[6] * pHard
}

export type WoundDist = number[]
export type SidePMF = Array<Map<number, { prob: number; wounds: WoundDist }>>

export function buildSidePMF(units: Unit[], defenderFirstD: number, isRangedSide = false): SidePMF {
  const m = units.length
  const pdPerUnit = units.map(u => perDieDistWound(u, isRangedSide))
  const sidePMF: SidePMF = []

  for (let k = 1; k <= 6; k++) {
    const map = new Map<number, { prob: number; wounds: WoundDist }>()
    const perUnitDP = units.map((unit, idx) => {
      const A = Math.max(0, Math.floor(unit.A))
      const dp: number[][] = Array.from({ length: A + 1 }, () => new Array(A + 1).fill(0))
      dp[0][0] = 1
      const pd = pdPerUnit[idx]
      for (let die = 0; die < A; die++) {
        const next: number[][] = Array.from({ length: A + 1 }, () => new Array(A + 1).fill(0))
        for (let j = 0; j <= die; j++) {
          for (let w = 0; w <= die; w++) {
            const base = dp[j][w]
            if (base === 0) continue
            for (let v = 1; v <= k; v++) {
              const p = pd[v]
              if (p === 0) continue
              let woundProb = 0
              if (!isRangedSide) {
                const attackerS = unit.S
                const { raw, toWound, hard } = computeToWound(attackerS, defenderFirstD)
                if (!hard) {
                  woundProb = v >= toWound ? 1 : 0
                } else {
                  if (v >= 6) {
                    const toWoundHard = computeToWoundHard(attackerS, defenderFirstD)
                    const hardPd = perDieDistWound(unit)
                    let ph = 0
                    for (let vv = toWoundHard; vv <= 6; vv++) ph += hardPd[vv]
                    woundProb = ph
                  } else {
                    woundProb = 0
                  }
                }
              } else {
                const hit = v >= unit.Sv
                if (!hit) woundProb = 0
                else {
                  const attackerS = unit.SS
                  const { raw, toWound, hard } = computeToWound(attackerS, defenderFirstD)
                  if (!hard) {
                    woundProb = v >= toWound ? 1 : 0
                  } else {
                    if (v >= 6) {
                      const toWoundHard = computeToWoundHard(attackerS, defenderFirstD)
                      const hardPd = perDieDistWound(unit)
                      let ph = 0
                      for (let vv = toWoundHard; vv <= 6; vv++) ph += hardPd[vv]
                      woundProb = ph
                    } else woundProb = 0
                  }
                }
              }

              const nj = j + (v === k ? 1 : 0)
              const mass = base * p
              next[nj][w] += mass * (1 - woundProb)
              next[nj][w + 1] += mass * woundProb
            }
          }
        }
        for (let j = 0; j <= A; j++) for (let w = 0; w <= A; w++) dp[j][w] = next[j][w]
      }
      return dp
    })

    const totalSubsets = 1 << m
    for (let mask = 1; mask < totalSubsets; mask++) {
      let maxFv = -Infinity
      for (let i = 0; i < m; i++) if ((mask & (1 << i)) !== 0) maxFv = Math.max(maxFv, units[i].Fv)
      let combined: number[] = [1]
      let combinedProb = 1
      let valid = true
      for (let i = 0; i < m; i++) {
        const dp = perUnitDP[i]
        const A = Math.max(0, Math.floor(units[i].A))
        const vec: number[] = new Array(A + 1).fill(0)
        if ((mask & (1 << i)) !== 0) {
          let sump = 0
          for (let j = 1; j <= A; j++) for (let w = 0; w <= A; w++) { vec[w] += dp[j][w]; sump += dp[j][w] }
          if (sump === 0) { valid = false; break }
        } else {
          let sump = 0
          for (let w = 0; w <= A; w++) { vec[w] = dp[0][w]; sump += dp[0][w] }
          if (sump === 0) { valid = false; break }
        }
        const newLen = combined.length + vec.length - 1
        const next = new Array(newLen).fill(0)
        for (let a = 0; a < combined.length; a++) {
          for (let b = 0; b < vec.length; b++) {
            next[a + b] += combined[a] * vec[b]
          }
        }
        combined = next
      }
      if (!valid) continue
      const prob = combined.reduce((s, a) => s + a, 0)
      if (prob === 0) continue
      const wounds = combined.slice()
      map.set(maxFv, { prob, wounds })
    }
    sidePMF.push(map)
  }
  return sidePMF
}

export type { BattleInput, EngineResult, Probabilities, Unit }
