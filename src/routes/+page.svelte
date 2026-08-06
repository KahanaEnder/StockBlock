<script lang="ts">
  import { goto } from '$app/navigation';
  import { Routes } from '$lib/constants/routes';
  import { PlaceHolders } from '$lib/constants/placeholders';

  let navigating = $state(false);

  function goToLogin() {
    if (navigating) return;
    navigating = true;
    goto(Routes.LOGIN);
  }
</script>

<h1>{PlaceHolders.ACCESS_D}</h1>
<p>{PlaceHolders.PH}</p>
<div>
  <button onclick={goToLogin}>
    {PlaceHolders.LOGIN}
  </button>
</div>