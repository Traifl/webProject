<script setup>
import { ref } from 'vue'
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { UserCircleIcon } from '@heroicons/vue/24/outline'
import ProfilePopup from './ProfilePopup.vue'

defineProps({
  toggle: {
    type: Function,
    required: true
  }
});

const search = ref('');
const showProfilePop = ref(false);
</script>

<template>
  <div class="p-2 border-b flex flex-row items-center justify-between">
    <div class="flex flex-row items-center gap-2">
      <Bars3Icon class="size-6 cursor-pointer" @click="toggle" />
      <p class="font-bold text-2xl">TODOwebsite</p>
    </div>

    <div class="rounded-2xl px-2 py-1 border flex flex-row justify-end gap-5 items-center">
      <input v-model="search" type="text" placeholder="Search" />
      <button class="cursor-pointer">
        <MagnifyingGlassIcon class="size-5" />
      </button>
    </div>

    <button class="cursor-pointer" @click="showProfilePop = true">
      <UserCircleIcon class="size-8" />
    </button>

    <ProfilePopup :show="showProfilePop" @close="showProfilePop = false"/>
  </div>
</template>
