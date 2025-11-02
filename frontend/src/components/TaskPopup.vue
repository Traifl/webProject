<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useGlobalStore } from '@/store'

const props = defineProps({
  show: Boolean,
  task: Object
});

const global = useGlobalStore();

const emit = defineEmits(['close']);
const close = () => emit('close');

const data = ref({title: '', status: ''});

const handleDelete = async () => {
  if (confirm(`Delete task "${props.task.title}" ?`)) {
    await global.deleteTask(props.task.id)
    close();
    await global.fetchTasks();
  }
};

</script>

<template>
  <div 
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 min-w-[300px] max-w-[500px] shadow-xl">
      <header class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Details</h2>
        <button @click="handleDelete">
          <TrashIcon class="size-5 text-red-500 hover:text-red-600 cursor-pointer"/>
        </button>
      </header>

      <div class="text-gray-700 leading-6">
        <div class="flex flex-row gap-1">
          <p class="font-bold">Title :</p>
          <input type="text" :placeholder="task.title" :v-model="data.title" :value="task.title">
        </div>
        <div class="flex flex-row gap-1">
          <p class="font-bold">Status :</p>
          <input type="text" :placeholder="task.status" :v-model="data.status" :value="task.status">
        </div>
        <p><span class="font-bold">Date :</span> {{ new Date(task.date).toUTCString().split('2025')[0] }}</p>

        <template v-if="task.folder_name">
          <p><span class="font-bold">Folder :</span> {{ task.folder_name }}</p>
        </template>

        <template v-else-if="task.id_group">
          <p><span class="font-bold">Group :</span> {{ task.id_group }}</p>
        </template>
      </div>

      <footer class="flex justify-between mt-4">
        <button class="bg-blue-300 hover:bg-blue-400 px-3 py-1 rounded cursor-pointer" @click="close">
          <p>Edit</p>
        </button>

        <button class="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded cursor-pointer" @click="close">
          <p>Close</p>
        </button>
      </footer>
    </div>
  </div>
</template>
