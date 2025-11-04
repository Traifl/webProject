<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../store';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const auth = useAuthStore();

const handleSignup = async () => {
    const {success} = await auth.signup({ username: username.value, password: password.value });
    if (success) router.push('/home');
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
                <button type="submit" class="bg-zinc-400 rounded p-1 border cursor-pointer" :disabled="auth.isLoading">{{ auth.isLoading ? "Loading..." : "Signup" }}</button>
            </div>
            <footer class="flex justify-center mt-2">
                <p class="text-xs">Already have an account ? <RouterLink to="/login"><strong>Login</strong></RouterLink></p>
            </footer>
        </form>
  
    </div>
</template>

  