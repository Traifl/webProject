<script setup>
const props = defineProps({
show: Boolean,
title: {
    type: String,
    default: ''
}
})
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<template>
    <div 
      v-if="show"
      class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="close"
    >
      <div class="bg-white rounded-lg p-6 min-w-[300px] max-w-[500px] shadow-xl">
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
        </header>
  
        <div class="text-gray-700">
          <slot></slot>
        </div>
  
        <footer class="flex justify-end mt-4 gap-2">
          <slot name="footer">
            <button 
              class="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded cursor-pointer"
              @click="close"
            >
              Fermer
            </button>
          </slot>
        </footer>
      </div>
    </div>
  </template>

  