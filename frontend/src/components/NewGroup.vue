<script setup>
import { ref, computed, watch } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { useGlobalStore } from '@/store'

const global = useGlobalStore();

const emit = defineEmits(['close']);

const close = () => {
  resetFields();
  emit('close')
};

const handleSubmit = async()=>{
    await global.createGroup({name: name.value, description: description.value});
    await global.fetchGroups();
    close();
};

const resetFields = ()=>{
    name.value = '';
    description.value = '';
}

const name = ref('');
const description = ref('');

</script>

<template>
    <div v-if="global.showNewGroup" class="fixed inset-0 flex items-center justify-center z-50" @click.self="close">
        <div class="bg-white rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-xl">
            <header class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-semibold">New Group</h2>
                <button @click="close" class="cursor-pointer">
                    <XMarkIcon class="size-5 text-gray-500 hover:text-gray-700"/>
                </button>
            </header>

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-0.5 text-gray-700">
                <div>
                    <label class="block text-sm font-medium">Name *</label>
                    <input v-model="name" type="text" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" required placeholder="Enter group name"/>
                </div>

                <div>
                    <label class="block text-sm font-medium">Description</label>
                    <textarea v-model="description" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" rows="1" placeholder="Enter description"></textarea>
                </div>

                <footer class="flex justify-end gap-3 mt-4">
                    <button type="button" @click="close" class="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
                </footer>
            </form>
        </div>

    </div>
</template>
