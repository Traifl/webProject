<script setup>
import { onMounted, ref } from 'vue';
import NewButton from './NewButton.vue';
import { useGlobalStore } from '@/store';

const global = useGlobalStore();

const emit = defineEmits(['select-binder']);
const selectedBinder = ref({name: 'All tasks', id: 0});

const selectBinder = (binder)=>{
    selectedBinder.value.name = binder.name;
    selectedBinder.value.id = binder.id ?? 0;
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

            <button class="cursor-pointer" @click="selectBinder({name: 'All tasks'})">
                <p :class="selectedBinder.name === 'All tasks' ? 'bg-gray-500 rounded' : '' ">All tasks</p>
            </button>

            <div v-for="folder in global.folders" :key="folder.name">
                <button class="cursor-pointer" @click="selectBinder(folder)">
                    <p :class="selectedBinder.name === folder.name ? 'bg-gray-500 rounded' : '' ">{{ folder.name }}</p>
                </button>
            </div>

            <NewButton label="New Folder" @click="global.showNewFolder = true"/>
        </div>

        <div>
            <p class="font-semibold">Group</p>
            <div v-for="group in global.groups" :key="group.name">
                <button class="cursor-pointer" @click="selectBinder(group)">
                    <p :class="selectedBinder.id === group.id ? 'bg-gray-500 rounded' : '' ">{{ group.name }}</p>
                </button>
            </div>
            <NewButton label="New Group" @click="global.showNewGroup = true"/>
        </div>
    </div>
</template>
