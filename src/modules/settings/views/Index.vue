<template>
  <Tab :tabs="tabs">
    <template #tabs="{ isActive }">
      <div v-show="isActive('account')">
        <Account />
      </div>

      <div v-show="isActive('support')">
        <Support />
      </div>

      <div v-if="isActive('notifications')">
        <Notifications />
      </div>

      <div v-if="isActive('branding')">
        <BrandingSettings />
      </div>

      <div v-if="isActive('api_keys')">
        <ApiKeysSettings />
      </div>
    </template>
  </Tab>
</template>

<script>
import Tab from '@/components/tab/Tab';
import Account from '@/modules/settings/views/Account';
import Notifications from '@/modules/settings/views/Notifications';
import Support from '@/modules/settings/views/Support';
import BrandingSettings from '@/modules/settings/components/BrandingSettings';
import ApiKeysSettings from '@/modules/settings/components/ApiKeysSettings';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';

export default {
  components: {
    Tab,
    Support,
    Notifications,
    Account,
    BrandingSettings,
    ApiKeysSettings
  },
  computed: {
    authStore: () => useAuthStore(),
    planStore: () => usePlanStore(),
    tabs() {
      const list = [
        { name: 'Minha Conta',  key: 'account',       icon: 'UserCircle' },
        { name: 'Notificações', key: 'notifications',  icon: 'Bell'       }
      ];

      if (this.authStore.me?.owner && this.authStore.me?.profile === 'admin') {
        const brandingLocked = this.planStore.features?.whiteLabel !== true;
        const apiLocked      = this.planStore.features?.apiAccess !== true;
        list.push({
          name:    'Identidade Visual',
          key:     'branding',
          icon:    'Sparkles',
          premium: brandingLocked ? 'Essential' : false
        });
        list.push({
          name:    'Integrações',
          key:     'api_keys',
          icon:    'Cog',
          premium: apiLocked ? 'Pro' : false
        });
      }

      list.push({ name: 'Suporte', key: 'support', icon: 'heart' });

      return list;
    }
  }
};
</script>
