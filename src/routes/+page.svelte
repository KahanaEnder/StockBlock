<script lang="ts">
  import { goto } from '$app/navigation';
  import {Routes} from '$lib/constants/routes'
  import {PlaceHolders} from '$lib/constants/placeholders'
</script>
      <h1>{PlaceHolders.ACCESS_D}</h1>
      <p>{PlaceHolders.PH}</p>
      <div>
        <button onclick={() => goto(Routes.LOGIN)}>
        {PlaceHolders.LOGIN}
        </button>
      </div>
