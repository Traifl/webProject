<script setup>
import { ref } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useGlobalStore } from '@/store'
import TaskPopup from './TaskPopup.vue'

const props = defineProps(['task'])
const global = useGlobalStore()

const showTaskPopup = ref(false)
</script>

<template>
  <div class="py-1.5 px-2 bg-zinc-400 m-1 max-w-64 rounded flex flex-col" :key="task.id">
    <div class="flex flex-row items-center justify-between">
      <div class="flex flex-row items-center gap-1">
        <button
          class="size-5 rounded-full cursor-pointer"
          :class="task.status === 'done' ? 'bg-lime-300' : task.status === 'doing' ? 'bg-amber-300' : 'bg-red-400'"
          @click="global.editStatus(task.id)"
        ></button>
        <p class="font-bold">{{ task.title }}</p>
      </div>
      <button class="cursor-pointer hover:bg-zinc-500 rounded" @click="showTaskPopup = true">
        <ExclamationCircleIcon class="size-4 rotate-180"/>
      </button>
    </div>

    <div>
      <p>{{ task.status }}</p>
      <p v-if="task.description">{{ task.description }}</p>
      <p v-if="task.deadline">{{ new Date(task.deadline).toUTCString().split('2025')[0] }}</p>
      <p v-if="task.priority">{{ task.priority }}</p>
      <p v-if="task.folder_name">{{ task.folder_name }}</p>
      <p v-else-if="task.group_name">{{ task.group_name }}</p>
    </div>

    <TaskPopup :show="showTaskPopup" :task="task" @close="showTaskPopup = false" />
  </div>
</template>
