<script setup>
import { onMounted, ref, computed } from 'vue';
import { useGlobalStore, useAuthStore, useChatStore } from '../store';
import TopBar from '@/components/TopBar.vue';
import SideBar from '@/components/SideBar.vue';
import Task from '@/components/Task.vue';
import NewTask from '@/components/NewTask.vue';
import { ArrowPathIcon, PlusCircleIcon } from '@heroicons/vue/24/solid'
import { AdjustmentsHorizontalIcon, ChatBubbleBottomCenterIcon, Cog6ToothIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import NewFolder from '@/components/NewFolder.vue';
import NewGroup from '@/components/NewGroup.vue';
import FolderPopup from '@/components/FolderPopup.vue';
import GroupPopup from '@/components/GroupPopup.vue';
import Chat from '@/components/Chat.vue';

const showSideBar = ref(true);
const showNewTask = ref(false);
const showFolderDetails = ref(false);
const showGroupDetails = ref(false);
const showFilters = ref(false);

const global = useGlobalStore();
const chat = useChatStore();

const toggleChat = ()=> chat.showChat = !chat.showChat

const toggleSideBar = ()=> showSideBar.value = !showSideBar.value;

const toggleFilters = ()=>{
  global.filters.status = "Select a status";
  global.filters.priority = "Select a priority";
  showFilters.value = !showFilters.value;
};

const resetFilters = ()=>{
  global.filters.status = "Select a status";
  global.filters.priority = "Select a priority";
}


onMounted(async()=>{
  await global.fetchTasks();
  await global.fetchUsers();
});

</script>

<template>
  <div class="flex flex-col">
    <TopBar :toggle="toggleSideBar"/>
    
    <div class="flex flex-row h-full">
      <SideBar 
        v-if="showSideBar"
      />      

      <div class="bg-gray-300 h-screen w-screen overflow-auto flex flex-row justify-between">
        <div>
          <div class="flex flex-row">
            <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-25 hover:bg-zinc-500 transition" @click="showNewTask = true">
              <PlusCircleIcon class="size-5" />
              <p>New Task</p>
            </div>
            <div class="flex flex-row bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between w-20 hover:bg-zinc-500 transition" @click="toggleFilters">
              <AdjustmentsHorizontalIcon class="size-5" />
              <p>Filters</p>
            </div>
            <div v-if="global.selectedBinder.name !== 'All tasks'" class="flex flex-row gap-2 bg-zinc-400 cursor-pointer rounded m-1 p-1 items-center justify-between hover:bg-zinc-500 transition" @click="global.selectedBinder.id ? showGroupDetails = true : showFolderDetails = true">
              <Cog6ToothIcon class="size-5"/>
              <p>{{ global.selectedBinder.name }}</p>
            </div>
          </div>
          <div v-if="showFilters" class="flex flex-row gap-1.5 mx-1">
            <select v-model="global.filters.status" class="border rounded-md px-1 py-0.5 focus:outline-none focus:ring">
              <option value="Select a status">Select a status</option>
              <option>to do</option>
              <option>doing</option>
              <option>done</option>
            </select>

            <select v-model="global.filters.priority" class="border rounded-md px-1 py-0.5 focus:outline-none focus:ring">
              <option value="Select a priority">Select a priority</option>
              <option>low</option>
              <option>mid</option>
              <option>high</option>
            </select>

            <button class="flex flex-row bg-zinc-400 cursor-pointer rounded p-1 items-center justify-between w-20 hover:bg-zinc-500 transition" @click="resetFilters">
              <ArrowPathIcon class="size-5"/>
              <p>Reset</p>
            </button>
          </div>

          <Task v-for="task in global.filteredTasks" :key="task.id" :task="task"/>
        </div>

        <div v-if="global.selectedBinder?.id" class="flex flex-row">
          <XMarkIcon v-if="chat.showChat" @click="toggleChat" class="size-6 cursor-pointer" />
          <ChatBubbleBottomCenterIcon v-else @click="toggleChat" class="size-6 cursor-pointer" />
          <Chat v-if="chat.showChat"/>
        </div>
      </div>
    </div>
    <NewTask :show="showNewTask" @close="showNewTask = false" :selectedBinder="global.selectedBinder"/>
    <FolderPopup :show="showFolderDetails" @close="showFolderDetails = false" :folder="global.selectedBinder"/>
    <GroupPopup :show="showGroupDetails" @close="showGroupDetails = false" :group="global.selectedBinder"/>
    <NewFolder @close="global.showNewFolder = false"/>
    <NewGroup @close="global.showNewGroup = false" />
  </div>
</template>
