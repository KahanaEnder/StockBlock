<script lang="ts">
  export let placeholder = 'Buscar...';
  export let onChange: (value: string) => void = () => {};

  let value = '';

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    onChange(value);
  }
</script>

<input
  type="text"
  bind:value
  placeholder={placeholder}
  on:input={handleInput}
/>
