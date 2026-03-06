import type { BattleInput, EngineResult, Unit } from './types'
import {
  makeEmptyProb,
  perDieDist,
  computeToWound,
  computeToWoundHard,
} from './engine-common'

// ── RNG ───────────────────────────────────────────────────────────

type RNG = () => number

function xorshift32(seed: number): RNG {
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

// ── Precomputed unit descriptor ───────────────────────────────────

interface UnitDescriptor {
  unit: Unit
  pd: number[]
  A: number
}

function buildUnitDescriptors(units: Unit[]): UnitDescriptor[] {
  return units.map(u => ({
    unit: u,
    pd: perDieDist(u),
    A: Math.max(0, Math.floor(u.A)),
  }))
}

// ── Per-side counters ─────────────────────────────────────────────

interface SideCounters {
  duelWins: number
  atLeast1: number
  atLeast2: number
  atLeast3: number
  totalWounds: number
  totalAttackDice: number
  rangedWounds: number
  rangedDice: number
  meleeWounds: number
  meleeDice: number
}

function emptySideCounters(): SideCounters {
  return {
    duelWins: 0,
    atLeast1: 0,
    atLeast2: 0,
    atLeast3: 0,
    totalWounds: 0,
    totalAttackDice: 0,
    rangedWounds: 0,
    rangedDice: 0,
    meleeWounds: 0,
    meleeDice: 0,
  }
}

// ── Per-iteration side result (returned by simulateSide) ──────────

interface SideIterationResult {
  maxRoll: number
  maxFv: number
  woundsPerUnit: number[]
  totalWounds: number
  meleeWounds: number
  rangedWounds: number
  totalDice: number
  meleeDice: number
  rangedDice: number
}

// ── Single die roll ───────────────────────────────────────────────

function rollDie(pd: number[], rng: RNG): number {
  const r = rng()
  let acc = 0
  let v = 1
  for (; v <= 6; v++) {
    acc += pd[v]
    if (r <= acc) break
  }
  return v > 6 ? 6 : v
}

// ── Wound resolution for a single attack die ─────────────────────

function resolveWound(
  unit: Unit,
  dieValue: number,
  defenderD: number,
  rng: RNG,
): boolean {
  let attackerS = unit.S
  let hit = true

  if (unit.ranged) {
    hit = dieValue >= unit.Sv
    attackerS = unit.SS
  }

  if (!hit) return false

  const { toWound, hard } = computeToWound(attackerS, defenderD)

  if (!hard) {
    return dieValue >= toWound
  }

  // Hard-to-wound: only on a natural 6 do we get a second roll
  if (dieValue < 6) return false

  const pd2 = perDieDist(unit)
  const v2 = rollDie(pd2, rng)
  const toWoundHard = computeToWoundHard(attackerS, defenderD)
  return v2 >= toWoundHard
}

// ── Simulate one side for a single iteration ─────────────────────

function simulateSide(
  descriptors: UnitDescriptor[],
  defenderD: number,
  rng: RNG,
): SideIterationResult {
  let maxRoll = 0
  let maxFv = -Infinity
  const woundsPerUnit: number[] = []
  let totalWounds = 0
  let meleeWounds = 0
  let rangedWounds = 0
  let totalDice = 0
  let meleeDice = 0
  let rangedDice = 0

  for (const { unit, pd, A } of descriptors) {
    totalDice += A
    if (unit.ranged) {
      rangedDice += A
    } else {
      meleeDice += A
    }

    let unitWounds = 0

    for (let a = 0; a < A; a++) {
      const v = rollDie(pd, rng)

      // Track highest roll for duel resolution
      if (v > maxRoll) {
        maxRoll = v
        maxFv = unit.Fv
      } else if (v === maxRoll && unit.Fv > maxFv) {
        maxFv = unit.Fv
      }

      if (resolveWound(unit, v, defenderD, rng)) {
        unitWounds++
      }
    }

    woundsPerUnit.push(unitWounds)
    totalWounds += unitWounds

    if (unit.ranged) {
      rangedWounds += unitWounds
    } else {
      meleeWounds += unitWounds
    }
  }

  return {
    maxRoll,
    maxFv,
    woundsPerUnit,
    totalWounds,
    meleeWounds,
    rangedWounds,
    totalDice,
    meleeDice,
    rangedDice,
  }
}

// ── Duel resolution ──────────────────────────────────────────────

function resolveDuel(
  goodResult: SideIterationResult,
  evilResult: SideIterationResult,
  rng: RNG,
): 'good' | 'evil' {
  if (goodResult.maxRoll > evilResult.maxRoll) return 'good'
  if (goodResult.maxRoll < evilResult.maxRoll) return 'evil'
  if (goodResult.maxFv > evilResult.maxFv) return 'good'
  if (goodResult.maxFv < evilResult.maxFv) return 'evil'
  return rng() < 0.5 ? 'good' : 'evil'
}

// ── Accumulate per-iteration results into running counters ────────

function accumulateIterationResult(
  result: SideIterationResult,
  descriptors: UnitDescriptor[],
  counters: SideCounters,
  wonDuel: boolean,
): void {
  counters.totalWounds += result.totalWounds
  counters.totalAttackDice += result.totalDice
  counters.meleeWounds += result.meleeWounds
  counters.meleeDice += result.meleeDice
  counters.rangedWounds += result.rangedWounds
  counters.rangedDice += result.rangedDice

  if (wonDuel) {
    counters.duelWins++
    const meleeWounds = result.woundsPerUnit.reduce(
      (sum, w, i) => sum + (descriptors[i].unit.ranged ? 0 : w),
      0,
    )
    if (meleeWounds >= 1) counters.atLeast1++
    if (meleeWounds >= 2) counters.atLeast2++
    if (meleeWounds >= 3) counters.atLeast3++
  }
}

// ── Build final result from counters ─────────────────────────────

function buildResult(
  goodCounters: SideCounters,
  evilCounters: SideCounters,
  iterations: number,
  computationTimeMs: number,
): EngineResult {
  const probabilities = makeEmptyProb()

  probabilities.good.duelWin = goodCounters.duelWins / iterations
  probabilities.evil.duelWin = evilCounters.duelWins / iterations

  probabilities.good.pAtLeast1Wound = goodCounters.atLeast1 / iterations
  probabilities.good.pAtLeast2Wounds = goodCounters.atLeast2 / iterations
  probabilities.good.pAtLeast3Wounds = goodCounters.atLeast3 / iterations
  probabilities.evil.pAtLeast1Wound = evilCounters.atLeast1 / iterations
  probabilities.evil.pAtLeast2Wounds = evilCounters.atLeast2 / iterations
  probabilities.evil.pAtLeast3Wounds = evilCounters.atLeast3 / iterations

  probabilities.good.pSingleAttackWound =
    goodCounters.meleeDice > 0 ? goodCounters.meleeWounds / goodCounters.meleeDice : 0
  probabilities.evil.pSingleAttackWound =
    evilCounters.meleeDice > 0 ? evilCounters.meleeWounds / evilCounters.meleeDice : 0

  probabilities.good.rangedWound =
    goodCounters.rangedDice > 0 ? goodCounters.rangedWounds / goodCounters.rangedDice : 0
  probabilities.evil.rangedWound =
    evilCounters.rangedDice > 0 ? evilCounters.rangedWounds / evilCounters.rangedDice : 0

  return {
    computationTimeMs,
    mode: 'Fast',
    probabilities,
  }
}

// ── Public API ────────────────────────────────────────────────────

export async function runMonteCarlo(
  input: BattleInput,
  iterations = 100000,
  seed?: number,
): Promise<EngineResult> {
  const rng: RNG = seed == null ? Math.random : xorshift32(seed)
  const t0 = (globalThis as any).performance.now()

  const goodDescriptors = buildUnitDescriptors(input.good)
  const evilDescriptors = buildUnitDescriptors(input.evil)

  const goodDefenderD = input.good.length > 0 ? input.good[0].D : 0
  const evilDefenderD = input.evil.length > 0 ? input.evil[0].D : 0

  const goodCounters = emptySideCounters()
  const evilCounters = emptySideCounters()

  for (let it = 0; it < iterations; it++) {
    const goodResult = simulateSide(goodDescriptors, evilDefenderD, rng)
    const evilResult = simulateSide(evilDescriptors, goodDefenderD, rng)

    const winner = resolveDuel(goodResult, evilResult, rng)

    accumulateIterationResult(goodResult, goodDescriptors, goodCounters, winner === 'good')
    accumulateIterationResult(evilResult, evilDescriptors, evilCounters, winner === 'evil')
  }

  const t1 = (globalThis as any).performance.now()
  return buildResult(goodCounters, evilCounters, iterations, t1 - t0)
}
