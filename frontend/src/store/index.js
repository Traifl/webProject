import { defineStore } from "pinia";
import { axiosInstance } from "@/lib/axios";

const order = {'to do': 0, 'doing': 1, 'done': 2};
const priority = {'low': 0, 'mid': 1, 'high': 2};

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
    async refreshUser(silent = false){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/auth/check');
        this.user = res.data;
      } catch (error) {
        if (!silent) toast.show('error', error.response?.data?.error);
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
    groups: [],
    users: [],
    groupUsers: [],
    taskUsers: [],
    showNewFolder: false,
    showNewGroup: false,
    selectedBinder : {name: "All tasks", id: 0},
    searchedTasks: [],
    filters:{
      status: "Select a status",
      priority: "Select a priority",
      search: null
    }
  }),
  actions: {
    setSelectedBinder(binder){
      this.selectedBinder = binder;
    },
    async health(){ //jamais utilisé
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/health');
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async createTask(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/task', data);
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
    async editStatus(id){
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
    async editTask(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/task/update', {data});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error); 
      }
    },
    async deleteTask(id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete('/task', {data: {id}});
        toast.show('success', res.data.message);
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
    },
    async createFolder(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/folder', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async createGroup(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.post('/group', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteFolder(folder_name){
      const toast = useToastStore();
      try {
        await axiosInstance.delete('/folder', {data: {folder_name}});
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editFolder(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/folder', {data});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async editGroup(data){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.put('/group/update', data);
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async quitGroup(group_id){
      const toast = useToastStore();
      try {
        await axiosInstance.delete('/group/quit', {data: {group_id}});
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async deleteGroup(group_id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.delete('/group', {data: {group_id}});
        toast.show('success', res.data.message);
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    },
    async fetchUsers(){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get('/user');
        this.users = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);      
      }
    },
    async fetchUsersInGroup(group_id){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/user/group/${group_id}`);
        this.groupUsers = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);      
      }
    },
    async fetchUsersInTask(task_id){ //jamais utilisé
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/user/task/${task_id}`);
        this.taskUsers = res.data;
      } catch (error) {
        toast.show('error', error.response?.data?.error);      
      }
    },
    async searchTasks(search){
      const toast = useToastStore();
      try {
        const res = await axiosInstance.get(`/task/${search}`);
        this.searchedTasks = res.data;
        this.filters.search = search;
      } catch (error) {
        toast.show('error', error.response?.data?.error);
      }
    }
  },
  getters: {
    filteredTasks: (state)=>{
      let list = state.filters.search ? state.searchedTasks : state.tasks;

      if (state.selectedBinder.name !== 'All tasks'){
        list = list.filter(task => task.folder_name === state.selectedBinder.name || task.group_id === state.selectedBinder.id);
      }

      if (state.filters.status && state.filters.status !== "Select a status"){
        list = list.filter(task=>task.status === state.filters.status);
      }

      if (state.filters.priority && state.filters.priority !== "Select a priority"){
        list = list.filter(task=>task.priority === state.filters.priority);
      }
      
      return list;
    }
  }
})