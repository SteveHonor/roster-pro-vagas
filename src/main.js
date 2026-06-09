// Captura o evento antes do Vue montar — evita perder o prompt na primeira carga
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaPrompt = e;
});

import App from './App.vue';

import '@/assets/css/index.scss';

import { createApp } from 'vue';
import { initAnalytics } from '@/analytics';

if (import.meta.env.VITE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import { useConfirmationStore } from '@/components/confirmation/store';
import { useDrawerStore } from '@/components/drawer/store';
import { usePlanStore } from '@/components/plan/store';

import { can } from '@/helper/can';

import pinia from './store/index.js';
import router from '@/router';
import VueAxios from 'vue-axios';
import axios from './axios.js';
import moment from 'moment';
import 'moment/dist/locale/pt-br';
moment.locale(navigator.language);
import VueTheMask from 'vue-the-mask';
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

app.use(router);
app.use(pinia);
app.use(VueTheMask);
app.use(VueAxios, axios);

const breadcrumbStore = useBreadcrumbStore();
const confirmationStore = useConfirmationStore();
const drawerStore = useDrawerStore();
const planStore = usePlanStore();

app.config.globalProperties.breadcrumbStore = breadcrumbStore;
app.config.globalProperties.confirmationStore = confirmationStore;
app.config.globalProperties.drawerStore = drawerStore;
app.config.globalProperties.planStore = planStore;
app.config.globalProperties.moment = moment;
app.config.globalProperties.$can = can();

app.mount('#app');

// Analytics: usuários do app já consentiram via ToS no cadastro
// O site cuida do consentimento de cookies para visitantes anônimos
initAnalytics(app, router);
