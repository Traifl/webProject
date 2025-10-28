<script setup>
import { ref } from 'vue';
import { axiosInstance } from '../lib/axios';
import Toast from '@/components/Toast.vue';
import { useRouter } from 'vue-router';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const toast = ref({ type: '', message: '' });
const router = useRouter();

const handleSignup = async () => {
  try {
    const res = await axiosInstance.post('/auth/signup', { username: username.value, password: password.value },);
    toast.show('success', res.data.message);
    router.push('/accueil');
  } catch (error) {
    error.response?.status === 500 ? toast.show('warning', error.response?.data?.error || 'Server error') : toast.show('error', error.response?.data?.error);
  }
};

const toggleShowPassword = ()=>{
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div class="flex flex-col items-center justify-center h-screen bg-gray-300">
        <form @submit.prevent="handleSignup" class="border p-2 m-1 rounded">
            <div class="flex flex-col mb-5">
                <p class="text-sm mb-2 font-medium">Username</p>
                <div class="flex flex-row items-center bg-zinc-400 rounded border px-3 py-1">
                    <UserIcon class="size-4 mr-2.5"/>
                    <input v-model="username" type="text" placeholder="Username" required />
                </div>
            </div>
            <div class="flex flex-col mb-5">
                <p class="text-sm mb-2 font-medium">Password</p>
                <div class="flex flex-row items-center bg-zinc-400 rounded border px-3 py-1">
                    <LockClosedIcon class="size-4 mr-2.5"/>
                    <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" required>
                    <EyeIcon v-if="showPassword" class="size-4 ml-2.5" @click="toggleShowPassword"/>
                    <EyeSlashIcon v-else class="size-4 ml-2.5" @click="toggleShowPassword"/>
                </div>
            </div>
            <div class="flex justify-center items-center">
                <button type="submit" class="bg-zinc-400 rounded border cursor-pointer p-2">Sign up</button>
            </div>
        </form>
  
    </div>
</template>

  