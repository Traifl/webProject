<script setup>
import { useAuthStore, useChatStore, useGlobalStore } from '@/store';
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid';

const global = useGlobalStore();
const chat = useChatStore();
const auth = useAuthStore();

const newMessage = ref("");
const messagesContainer = ref(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

onMounted(()=>{
    if (!chat.isConnected) chat.connectSocket();
    
    if (global.selectedBinder && global.selectedBinder.id) {
        chat.joinGroup(global.selectedBinder.id);
    }

    scrollToBottom();
});

onUnmounted(()=>{
    if (chat.socket && global.selectedBinder && global.selectedBinder.id) {
        chat.socket.emit("leave_group", global.selectedBinder.id);
    }
});

watch(
    ()=>global.selectedBinder,
    (newBinder)=>{
        if (newBinder.id !== chat.activeGroupId){
            if (!chat.isConnected) chat.connectSocket();

            chat.joinGroup(newBinder.id);
        }
    }
)

watch(
    () => chat.messages.length, 
    () => {
        scrollToBottom();
    }
);

const sendMessage = ()=>{
    if (newMessage.value.trim()){
        chat.sendMessage(newMessage.value);
        newMessage.value = '';
    }
};

const currentUser = auth.user?.username;

</script>

<template>
    <div class="flex flex-col h-full border-l shadow-md bg-white">
        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div v-for="(message, index) in chat.messages" :key="index" :class="['flex', message.username === currentUser ? 'justify-end' : 'justify-start']">
                <div :class="['max-w-xs lg:max-w-md p-3 rounded-xl shadow-sm', message.username === currentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-tl-none']">
                    <p v-if="message.username !== currentUser" class="font-bold text-sm mb-1">{{ message.username }}</p>
                    <p class="text-sm break-words">{{ message.content }}</p>
                </div>
            </div>
        </div>

        <footer class="border-t p-3 pb-10">
            <form @submit.prevent="sendMessage" class="flex gap-2">
                <input v-model="newMessage" type="text" placeholder="Write a message" class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"/>
                <button type="submit" :disabled="!newMessage.trim()" class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition">
                    <PaperAirplaneIcon class="size-5"/>
                </button>
            </form>
        </footer>
    </div>
</template>