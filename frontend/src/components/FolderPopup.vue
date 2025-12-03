<script setup>
import { ref, computed, watch } from 'vue'
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useGlobalStore } from '@/store'

const props = defineProps({
  show: Boolean,
  folder: Object
});

const global = useGlobalStore()

const emit = defineEmits(['close']);

const close = () => {
  resetFields();
  emit('close')
};

const name = ref('')

watch(
  () => props.folder,
  (folder) => {
    if (folder) {
      name.value = folder.name;
    }
  },
  { immediate: true }
);

const resetFields = ()=>{
  name.value = props.folder.name;
}

const handleUpdate = async () => {
  await global.editFolder({folder_name: props.folder.name, newFolder_name: name.value});
  await global.fetchFolders();
  await global.fetchTasks();
  global.setSelectedBinder({ name: name.value, id: 0 });
  close();
};


const handleDelete = async()=>{
  if (confirm(`Delete folder "${props.folder.name}" ?`)) {
    await global.deleteFolder(props.folder.name);
    await global.fetchFolders();
    await global.fetchTasks();
    global.setSelectedBinder({name: "All tasks", id: 0});
    close()
  }
}

</script>
<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50" @click.self="close">
        <div class="bg-white rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-xl">
            <header class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-semibold">Folder Details</h2>
                <button @click="handleDelete">
                    <TrashIcon class="size-5 text-red-500 hover:text-red-600 cursor-pointer"/>
                </button>
            </header>

            <form @submit.prevent="handleUpdate" class="flex flex-col gap-0.5 text-gray-700">
                <div>
                    <label class="block text-sm font-medium">Name</label>
                    <input v-model="name" type="text" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" required :placeholder="folder.name"/>
                </div>

                <footer class="flex justify-end gap-3 mt-4">
                    <button type="button" @click="close" class="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                </footer>
            </form>
        </div>
    </div>
</template>
