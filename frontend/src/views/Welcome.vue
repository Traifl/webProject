<script setup>
import { RouterLink } from 'vue-router';

</script>

<template>
  <div class="flex flex-col justify-center items-center bg-gray-300 h-screen gap-20">
    <p class="font-bold text-2xl">TODOwebsite</p>
    <p>LOGO</p>
    <div class="flex flex row items-center gap-4">
      <RouterLink to="/login" class="p-1 rounded bg-zinc-400 border">Login</RouterLink>
      <RouterLink to="/signup" class="p-1 rounded bg-zinc-400 border">Sign up</RouterLink>
    </div>
  </div>
</template>
