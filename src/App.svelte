<script lang="ts">
  import UnitEditor from './components/UnitEditor.svelte'
  import { runMonteCarlo, runExact } from './lib/engine'
  import type { BattleInput, EngineResult } from './lib/types'

  let mode: 'Fast' | 'Exact' = $state('Fast')
  let iterations = $state(100000)
  let seed: number | null = $state(null)
  let result: EngineResult | null = $state(null)
  let computing = $state(false)

  // utility to produce a fresh default unit object
  function getDefaultUnit(): BattleInput['good'][0] {
    return {
      Fv: 4,
      S: 4,
      D: 5,
      A: 1,
      twoHanded: false,
      Sv: 4,
      SS: 2,
      ranged: true,
    }
  }

  const defaultInput: BattleInput = {
    good: [getDefaultUnit()],
    evil: [getDefaultUnit()],
  }

  let input: BattleInput = $state(structuredClone(defaultInput))

  async function calculate() {
    computing = true
    try {
      if (mode === 'Fast') {
        result = await runMonteCarlo(input, iterations, seed ?? undefined)
      } else {
        result = await runExact(input)
      }
    } catch (e) {
      result = null
      // show error as alert for now
      alert(String(e))
    } finally {
      computing = false
    }
  }
</script>

<main>
  <h1>ME SBG Battle Calculator (scaffold)</h1>
  <div>
    <label>Mode:</label>
    <label>
      <input type="radio" bind:group={mode} value="Fast" />
      Fast (Monte Carlo)
    </label>
    <label>
      <input type="radio" bind:group={mode} value="Exact" />
      Exact
    </label>
    <label style="margin-left:1rem">Iterations:
      <input type="number" bind:value={iterations} min={1} />
    </label>
    <label style="margin-left:1rem">Seed (optional):
      <input type="number" bind:value={seed} />
    </label>
    <button onclick={calculate} disabled={computing}>
      {computing ? 'Computing…' : 'Calculate'}
    </button>
  </div>

  <section style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem">
    <div>
      <h3>Good units</h3>
      {#each input.good as unit, idx}
        <UnitEditor {unit} {idx} disableD={idx !== 0} onremove={() => input.good = [...input.good.slice(0, idx), ...input.good.slice(idx + 1)]} />
      {/each}
      <button onclick={() => input.good = [...input.good, getDefaultUnit()]}>Add Good Unit</button>
    </div>

    <div>
      <h3>Evil units</h3>
      {#each input.evil as unit, idx}
        <UnitEditor {unit} {idx} disableD={idx !== 0} onremove={() => input.evil = [...input.evil.slice(0, idx), ...input.evil.slice(idx + 1)]} />
      {/each}
      <button onclick={() => input.evil = [...input.evil, getDefaultUnit()]}>Add Evil Unit</button>
    </div>
  </section>

  {#if result}
    <section>
      <h2>Result</h2>
      <div>Mode: {result.mode}</div>
      <div>Computation time (ms): {result.computationTimeMs.toFixed(3)}</div>
      <pre>{JSON.stringify(result.probabilities, null, 2)}</pre>
    </section>
  {/if}
</main>

<style>
  main { padding: 1rem; font-family: system-ui, Arial }
  pre { background: #f7f7f7; padding: 0.5rem }
</style>

