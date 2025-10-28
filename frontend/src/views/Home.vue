<script setup>
import { onMounted, ref } from 'vue';
import { useGlobalStore, useAuthStore } from '../store';
import TopBar from '@/components/TopBar.vue';
import SideBar from '@/components/SideBar.vue';
import Task from '@/components/Task.vue';
import { useRouter } from 'vue-router';

const showSideBar = ref(true);

const global = useGlobalStore();
const auth = useAuthStore();

const router = useRouter();

const toggleSideBar = ()=>{
  showSideBar.value = !showSideBar.value;
};

const handleLogout = async()=>{
  await auth.logout();
  router.push('/')
}

onMounted(async()=>{
  await global.fetchTasks();
})

</script>

<template>
  <div class="flex flex-col">
    <TopBar :toggle="toggleSideBar"/>
    
    <!-- MAIN SCREEN -->
    <div class="flex flex-row h-screen">
      <SideBar v-if="showSideBar"/>      

      <div class="bg-gray-300 h-screen w-screen overflow-auto">
        <button class="p-1 bg-red-200 m-3 rounded cursor-pointer" @click="handleLogout">Logout</button>
        <Task v-for="task in global.tasks" :task="task"/>
      </div>
    </div>
  </div>
</template>
