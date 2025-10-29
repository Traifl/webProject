<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/store';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: Boolean,
});

const username = ref('')

const router = useRouter();
const auth = useAuthStore();

const emit = defineEmits(['close']);
const close = () => emit('close');

const handleLogout = async()=>{
  await auth.logout();
  router.push('/');
};

</script>

<template>
  <div 
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 min-w-[300px] max-w-[500px] shadow-xl">
        <header class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Profile</h2>
            <button @click="close" class="cursor-pointer">
                <XMarkIcon class="size-5 text-gray-500 hover:text-gray-700"/>
            </button>
        </header>

        <div class="text-gray-700 leading-6">
          <p>Username</p>
          <input type="text" :placeholder="auth.user.username" class="rounded" v-model="username">
        </div>

      <footer class="flex justify-between mt-4">
        <button class="bg-blue-300 hover:bg-blue-400 px-3 py-1 rounded cursor-pointer" @click="auth.updateUser(username)">
          <p>Edit</p>
        </button>

        <button class="px-3 py-1 rounded cursor-pointer bg-red-400 hover:bg-red-500" @click="handleLogout">
          <p>Logout</p>
        </button>
      </footer>
    </div>
  </div>
</template>
