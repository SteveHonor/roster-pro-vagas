<template>
  <div id="mySidenav" class="sidenav flex flex-col bg-white shadow-2xl">

    <!-- Header: logo + fechar -->
    <div class="flex items-center justify-between px-4 pt-5 pb-8">
      <router-link to="/" @click="closeNav()">
        <img :src="brandLogo" alt="Roster Pro" class="h-7 w-auto max-w-[7rem] object-contain" @error="onLogoError" />
      </router-link>
      <button class="rounded p-1 text-gray-400 hover:text-gray-600 transition" @click="closeNav()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="overflow-y-auto px-3 pb-3 space-y-0.5">
      <ul>
        <li v-for="item in menu" :key="item.to">
          <router-link
            v-if="$can.canView('dashboard') && $can.canAccess(item?.role)"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="isActiveItem(item.to)
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            @click="closeNav()"
          >
            <BaseIcon :name="item.icon" class="h-4 w-4 flex-shrink-0" />
            <span class="flex-1">{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Perfil no rodapé -->
    <div class="mt-auto px-3 py-3 border-t border-gray-100 space-y-1">
      <router-link
        to="/settings"
        class="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        @click="closeNav()"
      >
        <div class="flex items-center justify-center flex-shrink-0 text-xs font-bold rounded-md w-7 h-7 bg-blue-100 text-blue-600 uppercase">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-none truncate text-gray-900">{{ authStore.me?.name }}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ companyStore?.hasCompany ? companyStore?.getChosenCompany?.name : authStore.me?.email }}</p>
        </div>
      </router-link>

      <button
        v-if="isLoggedIn"
        class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        @click="logout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sair da conta
      </button>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useCompanyStore } from '@/modules/users/store/company';
import { useAuthStore } from '@/modules/auth/store';
import { useSidebarStore } from '@/components/layout/store/sidebar';
import logoDefault from '@/assets/roster.png';

export default {
  components: { BaseIcon },
  computed: {
    authStore:    () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    sidebarStore: () => useSidebarStore(),
    isLoggedIn: self => self.authStore.isSignedIn,
    brandLogo() {
      return this.authStore.branding?.logoUrl || logoDefault;
    },
    initials() {
      const name = this.authStore.me?.name || '';
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    },
    menu() {
      const isOperator = this.$can.canAccess('operator');
      const items = [
        { to: isOperator ? '/' : '/my-dashboard', icon: 'dashboard',      title: 'Dashboard',      role: 'user'     },
        { to: '/calendar',                          icon: 'calendar',       title: 'Calendário',     role: 'user'     },
        { to: '/requests',                          icon: 'block',          title: 'Solicitações',   role: 'user'     },
        { to: '/evaluations',                       icon: 'chart-bar',      title: 'Avaliações',     role: 'user'     },
        { to: '/users',                             icon: 'users',          title: 'Cadastros',      role: 'user'     },
        { to: '/settings',                          icon: 'tool',           title: 'Configurações',  role: 'user'     },
      ];
      if (isOperator) {
        items.splice(4, 0, { to: '/reports', icon: 'document-text', title: 'Relatórios', role: 'operator' });
      }
      return items;
    }
  },
  methods: {
    isActiveItem(to) {
      const path = this.$route?.path || '';
      if (to === '/' || to === '/my-dashboard') return path === to;
      return path.startsWith(to);
    },
    onLogoError(e) {
      e.target.src = logoDefault;
    },
    async logout() {
      await this.axios.delete('logout')
        .then(() => { this.authStore.setStepLogin(1); this.authStore.logout(); this.closeNav(); this.$router.replace('/signin'); })
        .catch(() => { this.authStore.setStepLogin(1); this.$router.replace('/signin'); });
    },
    closeNav() {
      const nav = document.getElementById('mySidenav');
      if (!nav) return;
      nav.style.width = '0';
      document.body.style.overflow = 'auto';
      this.sidebarStore.closeMobile();
    }
  }
};
</script>

<style lang="css" scoped>
.sidenav {
  height: 100%;
  overflow-x: hidden;
}
</style>
