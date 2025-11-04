<script setup>
import { onMounted, ref, computed } from 'vue';
import { useGlobalStore, useAuthStore } from '../store';
import TopBar from '@/components/TopBar.vue';
import SideBar from '@/components/SideBar.vue';
import Task from '@/components/Task.vue';
import NewTask from '@/components/NewTask.vue';
import { PlusCircleIcon } from '@heroicons/vue/24/solid'
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline';

const showSideBar = ref(true);
const showNewTask = ref(false);
const selectedBinder = ref('All tasks');

const global = useGlobalStore();

const toggleSideBar = ()=> showSideBar.value = !showSideBar.value;


onMounted(async()=>{
  await global.fetchTasks();
})

const filteredTasks = computed(() => {
  if (selectedBinder.value === 'All tasks') return global.tasks;
  return global.tasks.filter(task => task.folder_name === selectedBinder.value || task.group_name === selectedBinder.value);
});
</script>

<template>
  <div class="flex flex-col">
    <TopBar :toggle="toggleSideBar"/>
    
    <div class="flex flex-row h-screen">
      <SideBar 
        v-if="showSideBar"
        @select-binder="selectedBinder = $event"
      />      

      <div class="bg-gray-300 h-screen w-screen overflow-auto">
        <div class="flex flex-row">
          <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-25 hover:bg-zinc-500 transition" @click="showNewTask = true">
            <PlusCircleIcon class="size-5" />
            <p>New Task</p>
          </div>
          <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-20 hover:bg-zinc-500 transition" @click="">
            <AdjustmentsHorizontalIcon class="size-5" />
            <p>Filter</p>
          </div>
        </div>

        <Task v-for="task in filteredTasks" :key="task.id" :task="task"/>
      </div>
    </div>
    <NewTask :show="showNewTask" @close="showNewTask = false" />
  </div>
</template>
