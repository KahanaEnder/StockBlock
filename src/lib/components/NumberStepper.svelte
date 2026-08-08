<script lang="ts">
  let { value = $bindable(null), id = undefined, min = undefined, max = undefined, title = undefined } = $props<{
    value?: number | null;
    id?: string;
    min?: number;
    max?: number;
    title?: string;
  }>();

  let paso = $state(10);
  const pasos = [1, 5, 10, 50, 100, 500, 1000];

  let texto = $state('');

  $effect(() => {
    const v = value;
    if (v === null || v === undefined) {
      if (texto !== '') texto = '';
      return;
    }
    if (typeof v === 'number' && Number.isNaN(v)) return;
    const parsed = Number(texto);
    if (Number.isNaN(parsed) || parsed !== v) {
      texto = String(v);
    }
  });

  function clamp(n: number): number {
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  }

  function cambiar(delta: number) {
    const actual = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
    value = clamp(actual + delta);
  }

  function manejarInput(event: Event) {
    const textoDom = (event.currentTarget as HTMLInputElement).value;
    texto = textoDom;
    if (textoDom.trim() === '') {
      value = null;
      return;
    }
    const n = Number(textoDom);
    value = Number.isNaN(n) ? NaN : clamp(n);
  }
</script>

<div class="stepper">
  <button
    type="button"
    class="step-btn"
    aria-label={`Restar ${paso}`}
    onclick={() => cambiar(-paso)}
  >
    −
  </button>
  <input
    type="text"
    inputmode="decimal"
    autocomplete="off"
    class="input-dark stepper-input"
    {id}
    {min}
    {max}
    {title}
    value={texto}
    oninput={manejarInput}
    placeholder="0"
  />
  <button
    type="button"
    class="step-btn"
    aria-label={`Sumar ${paso}`}
    onclick={() => cambiar(paso)}
  >
    +
  </button>
</div>

<div class="step-row">
  <span class="step-label">Ajuste:</span>
  <select class="step-select" bind:value={paso} aria-label="Tamaño de ajuste">
    {#each pasos as p}
      <option value={p}>± {p}</option>
    {/each}
  </select>
</div>

<style>
  .stepper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .stepper-input {
    flex: 1;
    min-width: 5rem;
    text-align: center;
    -moz-appearance: textfield;
  }
  .stepper-input::-webkit-outer-spin-button,
  .stepper-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .step-btn {
    width: 2.4rem;
    height: 2.4rem;
    flex-shrink: 0;
    border-radius: 0.6rem;
    border: 1px solid var(--accent-blue);
    background: transparent;
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s;
  }
  .step-btn:hover {
    background: var(--accent-blue);
    color: #fff;
  }

  .step-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.35rem;
  }
  .step-label {
    color: var(--text-tertiary);
    font-size: 0.8rem;
  }
  .step-select {
    flex: 1;
    padding: 0.3rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    font-size: 0.85rem;
  }
</style>