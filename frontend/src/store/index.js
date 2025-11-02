import { defineStore } from "pinia";
import { axiosInstance } from "@/lib/axios";

const order = {'to do': 0, 'doing': 1, 'done': 2};

export const useToastStore = defineStore('toast', {
    state: () => ({
      message: '',
      type: '',
      isVisible: false,
    }),
    actions: {
      show(type, message) {
        this.type = type
        this.message = message
        this.isVisible = true
  
        setTimeout(() => {
          this.isVisible = false
        }, 3000)
      },
      hide() {
        this.isVisible = false
      },
    },
})

export const useAuthStore = defineStore('auth', {
  state: ()=>({
      user: null,
      isLoading: false,
  }),
  actions: {
    async login(data) {
      const toast = useToastStore()
      this.isLoading = true
      try {
        const res = await axiosInstance.post('/auth/login', data)
        this.user = res.data.user
        toast.show('success', res.data.message)
        return { success: true }
      } catch (error) {
        const msg = error.response?.data?.error || 'Server error'
        toast.show(error.response?.status === 500 ? 'warning' : 'error', msg)
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },
    async signup(data) {
      const toast = useToastStore();
      this.isLoading = true;
      try {
        const res = await axiosInstance.post('/auth/signup', data);
        this.user = res.data.user;
        toast.show('success', res.data.message);
        return { success: true }
      } catch (error) {
        const msg = error.response?.data?.error || 'Server error';
        toast.show(error.response?.status === 500 ? 'warning' : 'error', msg);
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },
    async refreshUser(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/auth/check');
        this.user = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error)
      }
    },
    async logout(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post("/auth/logout");
        this.user = null;
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async updateUser(username){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put("/auth/update", {username});
        this.user = res.data.user;
        toast.show('success', res.data.message)
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    }
  }
});

export const useGlobalStore = defineStore('global', {
  state: ()=>({
    tasks: [],
    folders: [],
    groups: []
  }),
  actions: {
    async health(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/health');
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchTasks(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/task');
        this.tasks = res.data.sort((a, b)=>order[a.status] - order[b.status]);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editTask(id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/task', {id});
        const updatedTask = res.data;
        
        const index = this.tasks.findIndex(task=>task.id === id);
        if (index !== -1) this.tasks.splice(index, 1, updatedTask);
        this.tasks.sort((a, b) => order[a.status] - order[b.status]);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteTask(id){
      const toast = useToastStore();
      try {
        await axiosInstance.delete('/task', {data: {id}});
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchFolders(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/folder');
        this.folders = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchGroups(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/group');
        this.groups = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    }
  }
})