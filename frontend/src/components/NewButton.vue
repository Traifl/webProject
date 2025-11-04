<script>
import { PlusCircleIcon } from '@heroicons/vue/24/solid'

export default {
  components: {
    PlusCircleIcon
  },
  props: ['label', 'action']
}
</script>

<template>
  <div class="flex items-center">
    <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-28 hover:bg-zinc-500 transition" @click="action">
      <PlusCircleIcon class="size-5" />
      <p>{{ label }}</p>
    </div>
  </div>
</template>
