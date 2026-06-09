import { createWebHistory, createRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { can } from '@/helper/can';

import AuthModule from '@/modules/auth/router';
import ProfileModule from '@/modules/users/router';
import DashboardModule from '@/modules/dashboard/router';
import CalendarModule from '@/modules/calendar/router';
import SettingsModule from '@/modules/settings/router';
import PoliticsModule from '@/modules/politics/router';
import RequestsModule from '@/modules/requests/router';
import EvaluationsModule from '@/modules/evaluations/router';
import ReportsModule from '@/modules/reports/router';
import MemberModule from '@/modules/member/router';
import VagasModule from '@/modules/vagas/router';

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
    ...ProfileModule,
    ...DashboardModule,
    ...CalendarModule,
    ...SettingsModule,
    ...PoliticsModule,
    ...RequestsModule,
    ...EvaluationsModule,
    ...ReportsModule,
    ...MemberModule,
    ...VagasModule,
    {
      path: '/:catchAll(.*)',
      redirect: '/pagina-nao-encontrada',
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/pagina-nao-encontrada',
      component: NotFound,
      meta: {
        layout: 'default',
        requiresAuth: false
      }
    }
  ]
});

const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

router.beforeEach((to, _, next) => {
  const store = useAuthStore();

  // 1. já está logado e tenta acessar rota de auth → redireciona para dashboard
  if (store.isSignedIn && to.meta.requiresAuth === false) {
    return next('/');
  }

  // 2. se precisa de auth e não está logado → vai pro signin
  if (to.meta.requiresAuth && !store.isSignedIn) {
    return next('/signin');
  }

  // 2. rotas restritas a admin/operator — colaborador é redirecionado
  if (to.meta.requiresOperator && !can().canAccess('operator')) {
    return next(isMobileDevice() ? '/member' : '/my-dashboard');
  }

  // 3. rotas com feature gate — plano sem acesso vai pro dashboard
  if (to.meta.requiresFeature && !can().canView(to.meta.requiresFeature)) {
    return next('/');
  }

  // 3. colaborador na raiz → mobile vai pro portal, desktop vai pro dashboard pessoal
  if (to.path === '/' && !can().canAccess('operator')) {
    return next(isMobileDevice() ? '/member' : '/my-dashboard');
  }

  // 4. colaborador tenta acessar /calendar diretamente
  if (to.path === '/calendar' && !can().canAccess('operator')) {
    return next(isMobileDevice() ? '/member/scales' : '/my-dashboard');
  }

  // 5. segue o fluxo normal
  return next();
});

export default router;
