<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useGlobalStore } from '@/store'

const props = defineProps({
  show: Boolean,
  selectedBinder: Object
})

const emit = defineEmits(['close'])
const global = useGlobalStore()

const title = ref('')
const description = ref('')
const status = ref('')
const deadline = ref('')
const priority = ref('')
const usernames = ref([])

const folder_name = ref('')
const group_id = ref('')

watch(
  () => props.selectedBinder,
  (binder) => {
    if (!binder) return;

    if (binder.id) {
      group_id.value = binder.id;
      folder_name.value = '';
    } else if (binder.id === 0){
      folder_name.value = '';
      group_id.value = '';
    } else{
      folder_name.value = binder.name;
      group_id.value = '';
    }
  },
  { immediate: true }
)

const isGroupSelected = computed(() => group_id.value !== '')

watch(folder_name, (newVal) => {
  if (newVal !== '') {
    group_id.value = ''
    usernames.value = []
  }
})

watch(group_id, async(newVal) => {
  if (newVal !== '') {
    folder_name.value = ''
    await global.fetchUsersInGroup(group_id.value);
  }
})

const resetFields = () => {
  title.value = ''
  description.value = ''
  status.value = ''
  deadline.value = ''
  priority.value = ''
  usernames.value = []
  folder_name.value = ''
  group_id.value = ''
}

const close = () => {
  resetFields()
  emit('close')
}

const handleSubmit = async () => {
  if (!title.value || !status.value) {
    alert('Title and status are mandatory')
    return
  }

  const data = {
    title: title.value,
    description: description.value || null,
    status: status.value,
    deadline: deadline.value || null,
    priority: priority.value || null,
    folder_name: folder_name.value || null,
    group_id: group_id.value !== '' ? group_id.value : null,
    usernames: isGroupSelected.value && usernames.value.length ? usernames.value : null
  }

  await global.createTask(data)
  await global.fetchTasks()
  close()
}
</script>

<template>
  <div 
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-xl">
      <header class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">New Task</h2>
        <button @click="close" class="cursor-pointer">
          <XMarkIcon class="size-5 text-gray-500 hover:text-gray-700"/>
        </button>
      </header>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-0.5 text-gray-700">
        <div>
          <label class="block text-sm font-medium">Title *</label>
          <input v-model="title" type="text" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" required placeholder="Enter title"/>
        </div>

        <div>
          <label class="block text-sm font-medium">Description</label>
          <textarea v-model="description" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" rows="1" placeholder="Enter description"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium">Status *</label>
          <select v-model="status" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" required>
            <option disabled value="">Select a status</option>
            <option>to do</option>
            <option>doing</option>
            <option>done</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Deadline</label>
          <input v-model="deadline" type="date" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" />
        </div>

        <div>
          <label class="block text-sm font-medium">Priority</label>
          <select v-model="priority" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring">
            <option disabled value="">Select a priority</option>
            <option>low</option>
            <option>mid</option>
            <option>high</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Folder</label>
          <select v-model="folder_name" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" :class="group_id !== '' ? 'bg-gray-100 text-gray-400' : ''">
              <option value="">Select a folder</option>
              <option v-for="folder in global.folders" :key="folder.name" :value="folder.name">
              {{ folder.name }}
              </option>
          </select>
        </div>

        <div>       
          <label class="block text-sm font-medium">Group</label>
          <select v-model="group_id" class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring" :class="folder_name !== '' ? 'bg-gray-100 text-gray-400' : ''">
              <option value="">Select a group</option>
              <option v-for="group in global.groups" :key="group.id" :value="group.id">
              {{ group.name }}
              </option>
          </select>
        </div>

        <div v-if="isGroupSelected">
          <label class="block text-sm font-medium">Usernames</label>
          <div v-for="user in global.groupUsers" :key="user.username" class="flex flex-row gap-1">
            <input type="checkbox" :value="user.username" v-model="usernames">
            <p>{{ user.username }}</p>
          </div>
        </div>

        <footer class="flex justify-end gap-3 mt-4">
          <button type="button" @click="close" class="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
        </footer>
      </form>
    </div>
  </div>
</template>
