<script setup>
import { ref, watch } from 'vue'
import { ArrowLeftStartOnRectangleIcon, XMarkIcon, HomeIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore, useGlobalStore } from '@/store'

const props = defineProps({
  show: Boolean,
  group: Object
});

const global = useGlobalStore()
const auth = useAuthStore()

const emit = defineEmits(['close']);

const name = ref('');
const description = ref('');
const usernames = ref([]);

const getFreshGroup = () => {
  return global.groups.find(g => g.id === props.group.id) || props.group;
}

const resetFields = ()=>{
  const freshGroup = getFreshGroup(); 

  name.value = freshGroup.name;
  description.value = freshGroup.description || "";
  usernames.value = freshGroup.usernames || [];
}

const close = () => {
  emit('close')
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetFields(); 
    }
  },
);

const handleUpdate = async() => {
  await global.editGroup({group_id: props.group.id, name: name.value, description: description.value, usernames: usernames.value});
  await global.fetchGroups();
  await global.fetchTasks();
  global.setSelectedBinder({ name: name.value, id: props.group.id });
  close()
};

const handleLeave = async()=>{
  if (confirm(`Are you sure you want to leave "${props.group.name}" ?`)) {
    await global.quitGroup(props.group.id);
    await global.fetchGroups();
    await global.fetchTasks()
    global.setSelectedBinder({name: "All tasks", id: 0});
    close();
  }
}

const handleDelete = async()=>{
  if (confirm(`Are you sure you want to delete "${props.group.name}" ?`)) {
    await global.deleteGroup(props.group.id);
    await global.fetchGroups();
    await global.fetchTasks()
    global.setSelectedBinder({name: "All tasks", id: 0});
    close();
  }
}
</script>
<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50" @click.self="close">
        <div class="bg-white rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-xl">
            <header class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-semibold">Group Details</h2>
                <div class="flex flex-row gap-1">
                  <button v-if="group.createdBy == auth.user.username" @click="handleDelete">
                    <TrashIcon class="size-5 text-red-500 hover:text-red-600 cursor-pointer"/>
                  </button>
                  <button @click="handleLeave">
                    <ArrowLeftStartOnRectangleIcon class="size-5 text-red-500 hover:text-red-600 cursor-pointer"/>
                  </button>
                </div>
            </header>

            <form @submit.prevent="handleUpdate" class="flex flex-col gap-0.5 text-gray-700">
                <div>
                    <label class="block text-sm font-medium">Name</label>
                    <input v-model="name" type="text" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" required :placeholder="group.name"/>
                </div>

                <div>
                    <label class="block text-sm font-medium">Description</label>
                    <textarea v-model="description" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" rows="1" :placeholder="group.description || 'Enter description'"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium">Usernames</label>
                    <div v-for="user in global.users" :key="user.username" class="flex flex-row gap-1">
                        <input type="checkbox" :value="user.username" v-model="usernames">
                        <div class="flex flex-row items-center gap-1">
                          <p>{{ user.username }}</p>
                          <HomeIcon  v-if="group.createdBy == user.username" class="size-4"/>
                        </div>
                    </div>
                </div>

                <footer class="flex justify-end gap-3 mt-4">
                    <button type="button" @click="close" class="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                </footer>
            </form>
        </div>
    </div>
</template>
