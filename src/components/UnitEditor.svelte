<script lang="ts">
  import type { Unit } from '../lib/types'

  let { unit, idx, disableD = false, onremove }: {
    unit: Unit, idx: number, disableD?: boolean, onremove?: () => void
  } = $props()
</script>

<div style="border:1px solid #ddd; padding:0.5rem; margin-bottom:0.5rem">
  <div>
    <label>Fv: <input type="number" bind:value={unit.Fv} min={1} /></label>
    <label style="margin-left:0.5rem">S: <input type="number" bind:value={unit.S} min={1} max={10} /></label>
    <label style="margin-left:0.5rem">D: <input type="number" bind:value={unit.D} min={1} max={10} disabled={disableD} /></label>
    <label style="margin-left:0.5rem">A: <input type="number" bind:value={unit.A} min={1} /></label>
    <label style="margin-left:0.5rem">2H: <input type="checkbox" bind:checked={unit.twoHanded} /></label>
    <button style="margin-left:0.5rem" onclick={onremove}>Remove</button>
  </div>
  <div style="margin-top:0.25rem">
    <label>Sv: <input type="number" bind:value={unit.Sv} min={1} max={6} /></label>
    <label style="margin-left:0.5rem">SS: <input type="number" bind:value={unit.SS} min={1} max={10} /></label>
  </div>
</div>
