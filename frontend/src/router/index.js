import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// Respect actual file names (Windows is case-insensitive but CI/other OSs are not)
import Home from '@/views/HomeView.vue'
import Login from '@/views/LoginView.vue'
import Register from '@/views/RegisterView.vue'
import Groups from '@/views/GroupsView.vue'
import GroupDetail from '@/views/GroupDetailView.vue'
import JoinGroup from '@/views/joinGroupView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/groups', name: 'Groups', component: Groups, meta: { requireAuth: true } },
  { path: '/groups/:id', name: 'GroupDetail', component: GroupDetail, meta: { requireAuth: true } },
  { path: '/join/:token', name: 'JoinGroup', component: JoinGroup, meta: { requireAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requireAuth && !auth.user) {
    try {
      await auth.fetchProfile()
    } catch (_e) {
      // ignore
    }
    if (!auth.user) {
      // Si c'est une route de join, sauvegarder le token pour rejoindre après connexion
      if (to.name === 'JoinGroup' && to.params.token) {
        sessionStorage.setItem('pendingInviteToken', to.params.token)
        return `/login?redirect=/join/${to.params.token}`
      }
      return '/login'
    }
  }
  
  // Si l'utilisateur est connecté et qu'il y a un token d'invitation en attente, le rejoindre
  if (auth.user && to.name === 'JoinGroup' && to.params.token) {
    // Le composant JoinGroup gérera le join
  }
})

export default router