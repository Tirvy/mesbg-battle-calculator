<script lang="ts">
  import UnitEditor from './components/UnitEditor.svelte'
  import { runMonteCarlo, runExact } from './lib/engine'
  import type { BattleInput, EngineResult, Probabilities, PlayerProbabilities } from './lib/types'

  let mode: 'Fast' | 'Exact' = $state('Fast')
  let iterations = $state(100000)
  let seed: number | null = $state(null)
  let result: EngineResult[] = $state([])
  let differences: Probabilities[] = $state([])
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
        result.push(await runMonteCarlo(input, iterations, seed ?? undefined))
      } else {
        result.push(await runExact(input))
      }
      // Calculate differences to previous result
      if (result.length >= 2) {
        const current = result[result.length - 1]
        const previous = result[result.length - 2]
        const diff: Probabilities = {
          good: {} as PlayerProbabilities,
          evil: {} as PlayerProbabilities
        }
        for (const key in current.probabilities.good) {
          if (current.probabilities.good[key] !== undefined && previous.probabilities.good[key] !== undefined) {
            diff.good[key] = current.probabilities.good[key]! - previous.probabilities.good[key]!
          }
        }
        for (const key in current.probabilities.evil) {
          if (current.probabilities.evil[key] !== undefined && previous.probabilities.evil[key] !== undefined) {
            diff.evil[key] = current.probabilities.evil[key]! - previous.probabilities.evil[key]!
          }
        }
        differences.push(diff)
      }
    } catch (e) {
      result = []
      differences = []
      // show error as alert for now
      alert(String(e))
    } finally {
      computing = false
    }
  }
</script>

<main>
  <h1>ME SBG Battle Calculator (scaffold)</h1>

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

  <section style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem">
    <div>
      <label>Mode:</label>
      <label>
        <input type="radio" bind:group={mode} value="Exact" />
        Exact
      </label>
      <label>
        <input type="radio" bind:group={mode} value="Fast" />
        Fast (Monte Carlo)
      </label>
      <label style="margin-left:1rem">Iterations:
        <input type="number" bind:value={iterations} min={1} disabled={mode !== 'Fast'} />
      </label>
      <label style="margin-left:1rem">Seed (optional):
        <input type="number" bind:value={seed} disabled={mode !== 'Fast'} />
      </label>
    </div>
    <div>
      <button onclick={calculate} disabled={computing}>
        {computing ? 'Computing…' : 'Calculate'}
      </button>
    </div>
  </section>

  {#each result.slice().reverse() as res, idx}
    <section>
      <h2>Result {result.length - idx}</h2>
      <div>Mode: {res.mode}</div>
      <div>Computation time (ms): {res.computationTimeMs.toFixed(3)}</div>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>GOOD</th>
            {#if idx < differences.length}
              <th>GOOD Δ</th>
            {/if}
            <th>EVIL</th>
            {#if idx < differences.length}
              <th>EVIL Δ</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each Object.keys(res.probabilities.good) as key}
            <tr>
              <td>{key}</td>
              <td>{res.probabilities.good[key]!.toFixed(3)}</td>
              {#if idx < differences.length}
                <td>{differences[differences.length - 1 - idx]!.good[key] !== undefined ? differences[differences.length - 1 - idx]!.good[key]!.toFixed(3) : 'N/A'}</td>
              {/if}
              <td>{res.probabilities.evil[key]!.toFixed(3)}</td>
              {#if idx < differences.length}
                <td>{differences[differences.length - 1 - idx]!.evil[key] !== undefined ? differences[differences.length - 1 - idx]!.evil[key]!.toFixed(3) : 'N/A'}</td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/each}
</main>

<style>
  main { padding: 1rem; font-family: system-ui, Arial }
  table { border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
</style>

