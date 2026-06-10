import { createWebHistory, createRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';

import AuthModule     from '@/modules/auth/router';
import DashboardModule from '@/modules/dashboard/router';
import UsersModule    from '@/modules/users/router';
import SettingsModule from '@/modules/settings/router';
import PoliticsModule from '@/modules/politics/router';
import VagasModule    from '@/modules/vagas/router';
import AgendaModule   from '@/modules/agenda/router';

import NotFound from '@/views/NotFound';

const router = createRouter({
  history: createWebHistory(),
  base: import.meta.env.BASE_URL,
  linkActiveClass: 'active',
  scrollBehavior() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ left: 0, top: 0, behavior: 'smooth' });
      });
    });
  },
  routes: [
    ...AuthModule,
    ...DashboardModule,
    ...UsersModule,
    ...SettingsModule,
    ...PoliticsModule,
    ...VagasModule,
    ...AgendaModule,
    {
      path: '/:catchAll(.*)',
      redirect: '/pagina-nao-encontrada',
      meta: { requiresAuth: false }
    },
    {
      path: '/pagina-nao-encontrada',
      component: NotFound,
      meta: { layout: 'default', requiresAuth: false }
    }
  ]
});

router.beforeEach((to, _, next) => {
  const store = useAuthStore();

  // Logado tentando acessar rota pública → vai para home
  if (store.isSignedIn && to.meta.requiresAuth === false) {
    return next('/');
  }

  // Rota protegida sem auth → login
  if (to.meta.requiresAuth && !store.isSignedIn) {
    return next('/signin');
  }

  // Colaborador sem perfil operator → redireciona para home
  if (to.meta.requiresOperator && store.user?.profile === 'user') {
    return next('/');
  }

  return next();
});

export default router;
