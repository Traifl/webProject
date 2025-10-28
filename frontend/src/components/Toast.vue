<template>
  <transition name="fade">
    <div
      v-if="toast.isVisible"
      class="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999]"
    >
      <div
        :class="[
          'flex items-center w-full max-w-sm p-4 text-gray-700 bg-white rounded-xl shadow-lg',
          'dark:text-gray-200 dark:bg-gray-800',
        ]"
        role="alert"
      >
        <div
          :class="[
            'inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg mr-3',
            iconBg,
            iconColor
          ]"
        >
          <component :is="icon" class="w-6 h-6" />
        </div>

        <div class="text-sm font-medium flex-1">
          {{ toast.message }}
        </div>

        <button
          @click="toast.hide"
          class="ml-3 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon class="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/store/'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'

const toast = useToastStore()

const icons = {
  success: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900',
  },
  error: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900',
  },
}

const icon = computed(() => icons[toast.type]?.icon || CheckCircleIcon)
const iconColor = computed(() => icons[toast.type]?.color || 'text-green-600')
const iconBg = computed(() => icons[toast.type]?.bg || 'bg-green-100')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
