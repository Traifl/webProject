import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../views/Welcome.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Home from '../views/Home.vue';
import { useAuthStore } from '../store'

const routes = [
  { path: '/', name: 'Welcome', component: Welcome },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/home', name: 'Home', component: Home, meta: {auth: true} },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.user) await auth.refreshUser()

  if (to.meta.auth && !auth.user) {
    next('/')
  } else if ((['Login', 'Welcome', 'Signup'].includes(to.name)) && auth.user) {
    next('/home')
  } else {
    next()
  }
})


export default router;
