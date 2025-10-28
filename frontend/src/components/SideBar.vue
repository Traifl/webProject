<script setup>
import { onMounted } from 'vue';
import NewButton from './NewButton.vue';
import { useGlobalStore } from '@/store';

const global = useGlobalStore();

const createFolder = ()=>{
    alert('create folder');
}

const createGroup = ()=>{
    alert('create group');
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
            <p>All tasks</p>
            <div v-for="folder in global.folders" :key="folder.name">
                <p>{{ folder.name }}</p>
            </div>
            <NewButton label="New Folder" :action="createFolder"/>
        </div>

        <div>
            <p class="font-semibold">Group</p>
            <div v-for="group in global.groups" :key="group.name">
                <p>{{ group.name }}</p>
            </div>
            <NewButton label="New Group" :action="createGroup"/>
        </div>
    </div>
</template>