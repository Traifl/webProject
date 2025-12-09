<script setup>
import { RouterLink } from 'vue-router';
import image from '../../public/logo.png'

</script>

<template>
  <div class="flex flex-col justify-center items-center bg-gray-300 h-screen gap-10">
    <p class="font-bold text-2xl">TODOwebsite</p>
    <img :src="image" alt="logo" class="size-50">
    <div class="flex flex row items-center gap-4">
      <RouterLink to="/login" class="p-1 rounded bg-zinc-400 border">Login</RouterLink>
      <RouterLink to="/signup" class="p-1 rounded bg-zinc-400 border">Sign up</RouterLink>
    </div>
  </div>
</template>
