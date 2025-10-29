<script setup>
import { onMounted, ref } from 'vue';
import NewButton from './NewButton.vue';
import { useGlobalStore } from '@/store';

const global = useGlobalStore();

const emit = defineEmits(['select-binder']);
const selectedBinder = ref('All tasks');

const createFolder = ()=>{
    alert('create folder');
}

const createGroup = ()=>{
    alert('create group');
}

const selectBinder = (binder)=>{
    selectedBinder.value = binder;
    emit('select-binder', binder);
}

onMounted(async()=>{
    await global.fetchFolders();
    await global.fetchGroups();
})
</script>

<template>
    <div class="flex flex-col border-r divide-y w-1/4">
        <div>
            <p class="font-semibold">Folder</p>

            <button class="cursor-pointer" @click="selectBinder('All tasks')">
                <p :class="selectedBinder === 'All tasks' ? 'bg-gray-500 rounded' : '' ">All tasks</p>
            </button>

            <div v-for="folder in global.folders" :key="folder.name">
                <button class="cursor-pointer" @click="selectBinder(folder.name)">
                    <p :class="selectedBinder === folder.name ? 'bg-gray-500 rounded' : '' ">{{ folder.name }}</p>
                </button>
            </div>

            <NewButton label="New Folder" :action="createFolder"/>
        </div>

        <div>
            <p class="font-semibold">Group</p>
            <div v-for="group in global.groups" :key="group.name">
                <button class="cursor-pointer" @click="selectBinder(group.name)">
                    <p :class="selectedBinder === group.name ? 'bg-gray-500 rounded' : '' ">{{ group.name }}</p>
                </button>
            </div>
            <NewButton label="New Group" :action="createGroup"/>
        </div>
    </div>
</template>
