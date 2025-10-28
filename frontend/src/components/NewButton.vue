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
  <div class="flex justify-center items-center">
    <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-[120px] hover:bg-zinc-500 transition" @click="action">
      <PlusCircleIcon class="size-5" />
      <p>{{ label }}</p>
    </div>
  </div>
</template>
