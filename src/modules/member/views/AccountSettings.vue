<template>
  <div>
    <!-- Header -->
    <div class="sticky top-0 z-10 flex h-12 items-center border-b border-slate-100 bg-white px-4">
      <router-link
        to="/member/profile"
        class="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <BaseIcon name="ChevronLeft" class="!size-4" />
        Config.
      </router-link>
      <span class="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-800">
        Minha Conta
      </span>
    </div>

    <!-- Hero mobile -->
    <div class="bg-gradient-to-b from-slate-50 to-white px-5 pb-6 pt-7">
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold uppercase text-white shadow-lg ring-4 ring-white">
          {{ initials }}
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900">{{ authStore.me?.name }}</h1>
          <p class="mt-0.5 text-sm text-slate-500">{{ authStore.me?.email }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <RatingStars :rating="authStore.me?.averageRating" mode="numeric" />
        </div>
      </div>
    </div>

    <!-- Conteúdo Account sem header -->
    <div class="px-4 pt-5 pb-8">
      <Account :hide-header="true" />
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';
import Account from '@/modules/settings/views/Account';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: { BaseIcon, RatingStars, Account },
  computed: {
    authStore: () => useAuthStore(),
    initials() {
      const name = this.authStore.me?.name || '';
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    }
  }
};
</script>
