<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <!-- Header -->
    <header class="fixed top-0 z-30 flex h-12 w-full items-center justify-between border-b border-slate-200 bg-white px-4">
      <img
        :src="brandLogo"
        alt="logo"
        class="h-7 max-w-[8rem] object-contain"
        @error="onLogoError"
      />
      <div class="flex items-center gap-1">
        <PwaInstallButton />
        <Notification />
      </div>
    </header>

    <!-- Conteúdo -->
    <main class="flex-1 pb-[76px] pt-12">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav
      class="fixed bottom-0 z-30 w-full border-t border-slate-200 bg-white"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <div class="flex h-[64px] items-stretch">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150"
        >
          <div class="relative">
            <BaseIcon
              :name="item.icon"
              class="!size-6 transition-colors duration-150"
              :style="isActive(item.to) ? 'color: var(--brand-primary, #6366f1)' : 'color: #94a3b8'"
            />
            <span
              v-if="item.badge > 0"
              class="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </div>
          <span
            class="text-xs leading-none transition-colors duration-150"
            :style="isActive(item.to) ? 'color: var(--brand-primary, #6366f1)' : 'color: #94a3b8'"
            :class="isActive(item.to) ? 'font-semibold' : 'font-medium'"
          >
            {{ item.label }}
          </span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Notification from '@/components/notification/Notification';
import PwaInstallButton from '@/components/pwa/InstallButton';
import { useAuthStore } from '@/modules/auth/store';
import { useNotificationStore } from '@/components/notification/store';
import { useMemberStore } from '@/modules/member/store';
import { syncUser } from '@/services';
import logoDefault from '@/assets/roster.png';

export default {
  components: { BaseIcon, Notification, PwaInstallButton },

  data() {
    return { logoFailed: false };
  },

  computed: {
    authStore() { return useAuthStore(); },
    notificationStore() { return useNotificationStore(); },
    memberStore() { return useMemberStore(); },

    brandLogo() {
      if (this.logoFailed) return logoDefault;
      return this.authStore.branding?.logoUrl || logoDefault;
    },

    userInitial() {
      const name = this.authStore.me?.name || this.authStore.user?.name || '';
      return name.trim().charAt(0).toUpperCase() || '?';
    },

    navItems() {
      return [
        { to: '/member',              label: 'Início',       icon: 'Squares',    badge: 0 },
        { to: '/member/requests',     label: 'Solicitações', icon: 'Clipboard',  badge: 0 },
        { to: '/member/scales',       label: 'Escalas',      icon: 'Rocket',     badge: 0 },
        { to: '/member/broadcasts',   label: 'Avisos',       icon: 'Megaphone',  badge: 0 },
        { to: '/member/profile',      label: 'Config.',      icon: 'Cog',        badge: 0 }
      ];
    }
  },

  mounted() {
    try { syncUser.sync(this.axios); } catch { /* ignore */ }
    try { this.memberStore.fetchPendingCount(this.axios, this.authStore.user?.id); } catch { /* ignore */ }
  },

  methods: {
    isActive(to) {
      const path = this.$route?.path || '';
      if (to === '/member') return path === '/member';
      return path.startsWith(to);
    },
    onLogoError() {
      this.logoFailed = true;
    }
  }
};
</script>
