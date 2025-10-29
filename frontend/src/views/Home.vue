<script setup>
import { onMounted, ref, computed } from 'vue';
import { useGlobalStore, useAuthStore } from '../store';
import TopBar from '@/components/TopBar.vue';
import SideBar from '@/components/SideBar.vue';
import Task from '@/components/Task.vue';

const showSideBar = ref(true);
const selectedBinder = ref('All tasks');

const global = useGlobalStore();
const auth = useAuthStore();

const toggleSideBar = ()=> showSideBar.value = !showSideBar.value;


onMounted(async()=>{
  await global.fetchTasks();
})

const filteredTasks = computed(() => {
  if (selectedBinder.value === 'All tasks') return global.tasks;
  return global.tasks.filter(task => task.folder_name === selectedBinder.value || task.id_group === selectedBinder.value);
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
        <Task v-for="task in filteredTasks" :key="task.id" :task="task"/>
      </div>
    </div>
  </div>
</template>
