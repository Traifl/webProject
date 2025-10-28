<script>
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid';
import { UserCircleIcon } from '@heroicons/vue/24/outline';

export default {
    components: {
        Bars3Icon, MagnifyingGlassIcon, UserCircleIcon
    },
    data(){
        return{
            search: ''
        }
    },
    props: ['toggle']
}
</script>

<template>
    <div class="p-2 border-b flex flex-row items-center justify-between">
      <div class="flex flex-row items-center gap-2">
        <Bars3Icon class="size-6 cursor-pointer" @click="toggle"/>
        <p class="font-bold text-2xl">TODOwebsite</p>
      </div>
      <div class="rounded-2xl px-2 py-1 border flex flex-row jutify-end gap-5 items-center">
        <input v-model="search" type="text" placeholder="Search">
        <MagnifyingGlassIcon class="size-4"/>
      </div>
      <UserCircleIcon class="size-8"/>
    </div>
</template>
