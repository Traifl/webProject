<script setup>
import { defineProps, defineEmits } from 'vue'
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/store'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close'])

const auth = useAuthStore()

const close = () => emit('close')

</script>

<template>
  <div 
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 min-w-[300px] max-w-[500px] shadow-xl">
        <header class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Profile</h2>
            <button @click="close">
                <XMarkIcon class="size-5 text-gray-500 hover:text-gray-700"/>
            </button>
        </header>

        <div class="text-gray-700 leading-6">
            <p>caca</p>
        </div>

      <footer class="flex justify-end mt-6">
        <button 
          class="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded cursor-pointer"
          @click="close"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>
