<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Unit } from '../lib/types'

  export let unit: Unit
  export let idx: number
  export let disableD: boolean = false

  const dispatch = createEventDispatcher()

  function remove() {
    dispatch('remove')
  }
</script>

<div style="border:1px solid #ddd; padding:0.5rem; margin-bottom:0.5rem">
  <div>
    <label>Fv: <input type="number" bind:value={unit.Fv} min={1} /></label>
    <label style="margin-left:0.5rem">S: <input type="number" bind:value={unit.S} min={1} max={10} /></label>
    <label style="margin-left:0.5rem">D: <input type="number" bind:value={unit.D} min={1} max={10} disabled={disableD} /></label>
    <label style="margin-left:0.5rem">A: <input type="number" bind:value={unit.A} min={1} /></label>
    <label style="margin-left:0.5rem">2H: <input type="checkbox" bind:checked={unit.twoHanded} /></label>
    <button style="margin-left:0.5rem" on:click={remove}>Remove</button>
  </div>
  <div style="margin-top:0.25rem">
    <label>Sv: <input type="number" bind:value={unit.Sv} min={1} max={6} /></label>
    <label style="margin-left:0.5rem">SS: <input type="number" bind:value={unit.SS} min={1} max={10} /></label>
    <label style="margin-left:0.5rem">Ranged: on</label>
  </div>
</div>
