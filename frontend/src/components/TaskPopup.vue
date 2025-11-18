<script setup>
import { ref, watch, computed } from 'vue'
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useGlobalStore } from '@/store'

const props = defineProps({
  show: Boolean,
  task: Object
})

const global = useGlobalStore()
const emit = defineEmits(['close'])

const close = () => {
  resetFields();
  emit('close')
}

const title = ref('')
const description = ref('');
const status = ref('')
const deadline = ref('');
const priority = ref('');
const folder_name = ref('');
const group_id = ref('');
const usernames = ref('');


const isGroupSelected = computed(() => group_id.value !== '');

watch(folder_name, (newVal) => {
  if (newVal) {
    group_id.value = ''
    usernames.value = ''
  }
})

watch(group_id, (newVal) => {
  if (newVal) {
    folder_name.value = ''
  }
});

watch(
  () => props.task,
  (task) => {
    if (task) {
      title.value = task.title || '';
      description.value = task.description || '';
      status.value = task.status || '';
      deadline.value = task.deadline || '';
      priority.value = task.priority || "";
      group_id.value = task.group_id || '';
      folder_name.value = task.folder_name || '';
    }
  },
  { immediate: true }
)

const resetFields = () => {
  title.value = props.task.title;
  description.value = props.task.description;
  status.value = props.task.status;
  deadline.value = props.task.deadline;
  priority.value = props.task.priority;
  group_id.value = props.task.group_id;
  folder_name.value = props.task.folder_name
}

const handleDelete = async () => {
  if (confirm(`Delete task "${props.task.title}" ?`)) {
    await global.deleteTask(props.task.id)
    close()
    await global.fetchTasks()
  }
}

const handleUpdate = async () => {
  const payload = {
    id: props.task.id,
    title: title.value,
    status: status.value,
  }

  //await global.editTask(payload)
  await global.fetchTasks()
  close()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50" @click.self="close">
    <div class="bg-white rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-xl">
      <header class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold">Task Details</h2>
        <button @click="handleDelete">
          <TrashIcon class="size-5 text-red-500 hover:text-red-600 cursor-pointer"/>
        </button>
      </header>

      <form @submit.prevent="handleUpdate" class="flex flex-col gap-1 text-gray-700">
        <div>
          <label class="block text-sm font-medium">Title</label>
          <input v-model="title" type="text" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" :placeholder="task.title"/>
        </div>

        <div>
          <label class="block text-sm font-medium">Description</label>
          <textarea v-model="description" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" rows="1" :placeholder="task.description || 'Enter description'"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium">Status</label>
          <select v-model="status" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" >
            <option disabled value="">Select a status</option>
            <option>to do</option>
            <option>doing</option>
            <option>done</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Deadline</label>
          <input v-model="deadline" type="date" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" :placeholder="task.deadline || 'caca'"/>
        </div>

        <div>
          <label class="block text-sm font-medium">Priority</label>
          <select v-model="priority" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring">
            <option disabled value="">Select a priority</option>
            <option>low</option>
            <option>mid</option>
            <option>high</option>
          </select>
        </div>

        <div>
            <label class="block text-sm font-medium">Folder</label>
            <select v-model="folder_name" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" :class="group_id !== '' ? 'bg-gray-100 text-gray-400' : ''">
                <option value="">Select a folder</option>
                <option v-for="folder in global.folders" :key="folder.name" :value="folder.name">
                {{ folder.name }}
                </option>
            </select>
        </div>

        <div>       
            <label class="block text-sm font-medium">Group</label>
            <select v-model="group_id" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" :class="folder_name !== '' ? 'bg-gray-100 text-gray-400' : ''">
                <option value="">Select a group</option>
                <option v-for="group in global.groups" :key="group.id" :value="group.id">
                {{ group.name }}
                </option>
            </select>
        </div>

        <div v-if="isGroupSelected">
          <label class="block text-sm font-medium">Usernames</label>
          <input v-model="usernames" type="text" class="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring" placeholder="ex: alice,bob,charlie" />
        </div>

        <div>
          <p class="text-sm mt-1"><strong>Created on: </strong><span>{{ new Date(task.date).toUTCString().split('2025')[0] }}</span></p>
        </div>

        <footer class="flex justify-end gap-3 mt-4">
          <button type="button" @click="close" class="px-4 py-1.5 border rounded-md hover:bg-gray-100">Close</button>
          <button type="submit" class="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
        </footer>

      </form>
    </div>
  </div>
</template>
