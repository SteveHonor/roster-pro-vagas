<template>
  <div class="px-4 py-5">

    <!-- Hero — igual ao AccountSettings -->
    <div class="mb-4 rounded-xl bg-white shadow-sm overflow-hidden">
      <div class="bg-gradient-to-b from-slate-50 to-white px-5 pb-5 pt-6 flex flex-col items-center gap-3 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold uppercase text-white shadow-lg ring-4 ring-white">
          {{ initials }}
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900">{{ authStore.me?.name }}</p>
          <p class="mt-0.5 text-sm text-slate-500">{{ authStore.me?.email }}</p>
        </div>
        <div class="flex items-center gap-1">
          <BaseIcon v-for="i in 5" :key="i" name="Star" class="!size-3.5" :class="i <= Math.round(Number(authStore.me?.averageRating) || 0) ? 'text-amber-400' : 'text-slate-200'" />
          <span class="ml-1 text-xs text-slate-400">{{ authStore.me?.averageRating != null ? Number(authStore.me.averageRating).toFixed(1) : '0.0' }}</span>
        </div>
      </div>

      <!-- Instituições -->
      <div v-if="companies.length > 1" class="border-t border-slate-100 px-4 pt-3 pb-1">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Instituição</p>
        <div class="flex flex-col gap-1">
          <button
            v-for="company in companies"
            :key="company.id"
            class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition"
            :class="companyStore.getChosenCompany?.id === company.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
            @click="selectCompany(company)"
          >
            {{ company.name }}
            <BaseIcon v-if="companyStore.getChosenCompany?.id === company.id" name="Check" class="!size-4 text-indigo-500" />
          </button>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="rounded-xl bg-white shadow-sm overflow-hidden">
      <router-link
        to="/member/account"
        class="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <BaseIcon name="User" class="!size-4 text-slate-400" />
        Minha Conta
        <BaseIcon name="ChevronRight" class="ml-auto !size-4 text-slate-300" />
      </router-link>
      <router-link
        to="/member/notifications"
        class="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <BaseIcon name="Bell" class="!size-4 text-slate-400" />
        Notificações
        <BaseIcon name="ChevronRight" class="ml-auto !size-4 text-slate-300" />
      </router-link>
      <button
        class="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-red-500 transition hover:bg-red-50"
        @click="logout"
      >
        <BaseIcon name="XMark" class="!size-4" />
        Sair
      </button>
    </div>

    <!-- Versão / PWA info -->
    <p class="mt-6 text-center text-xs text-slate-300">Roster Pro · v{{ appVersion }}</p>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';

export default {
  components: { BaseIcon },

  computed: {
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore(),

    initials() {
      const name = this.authStore.me?.name || '';
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    },

    companies() {
      return this.companyStore.getCompanies || [];
    },

    appVersion() {
      return import.meta.env.VITE_APP_VERSION || '1.0';
    }
  },

  methods: {
    selectCompany(company) {
      this.companyStore.setChosenCompany({ company: company.id });
      this.$router.replace('/member').then(() => this.$router.go());
    },

    async logout() {
      try {
        await this.axios.delete('logout');
      } finally {
        this.authStore.setStepLogin(1);
        this.authStore.logout();
        this.$router.replace('/signin');
      }
    }
  }
};
</script>
