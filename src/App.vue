<template>
  <Maintenance v-if="isMaintenance" />
  <component :is="layout" v-else>
    <AdminBlockAccount />
    <BlockAccount />
    <router-view />
    <Confirmation />
    <ModalWelcome />
    <Limit />
    <Upgrade />
  </component>
</template>

<script>
import EmptyLayout from '@/layouts/EmptyLayout';
import DefaultLayout from '@/layouts/DefaultLayout';
import AuthLayout from '@/layouts/AuthLayout';
import MobileLayout from '@/layouts/MobileLayout';
import Confirmation from '@/components/confirmation/Confirmation';
import Maintenance from '@/views/Maintenance';
import Limit from '@/components/plan/Limit';
import ModalWelcome from '@/components/modal/ModalWelcome';
import BlockAccount from '@/components/modal/BlockAccount';
import AdminBlockAccount from '@/components/modal/AdminBlockAccount';
import Upgrade from '@/components/plan/Upgrade.vue';
import { useAuthStore } from '@/modules/auth/store';

function darkenHex(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = 1 - pct / 100;
  const r = Math.round(((n >> 16) & 0xff) * f);
  const g = Math.round(((n >> 8)  & 0xff) * f);
  const b = Math.round((n         & 0xff) * f);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Retorna '#fff' ou '#111' baseado na luminância percebida (WCAG)
function contrastColor(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8)  & 0xff;
  const b =  n        & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111111' : '#ffffff';
}

export default {
  components: {
    BlockAccount,
    AdminBlockAccount,
    EmptyLayout,
    DefaultLayout,
    AuthLayout,
    MobileLayout,
    Confirmation,
    Maintenance,
    Limit,
    Upgrade,
    ModalWelcome
  },
  data: () => ({
    defaultLayout: 'default'
  }),
  computed: {
    isMaintenance: () => import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    layout: self => `${self.$route?.meta?.layout || self.defaultLayout}-layout`,
    authStore: () => useAuthStore()
  },
  watch: {
    'authStore.branding': {
      immediate: true,
      deep: true,
      handler(branding) {
        if (branding?.primaryColor) {
          document.documentElement.style.setProperty('--brand-primary',      branding.primaryColor);
          document.documentElement.style.setProperty('--brand-primary-dark', darkenHex(branding.primaryColor, 15));
          document.documentElement.style.setProperty('--brand-primary-text', contrastColor(branding.primaryColor));
        } else {
          document.documentElement.style.removeProperty('--brand-primary');
          document.documentElement.style.removeProperty('--brand-primary-dark');
          document.documentElement.style.removeProperty('--brand-primary-text');
        }
      }
    }
  }
};
</script>
