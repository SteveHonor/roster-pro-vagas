<template>
  <div v-if="count > 0 && !dismissed" class="relative mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 pr-9 sm:pr-4">
    <button type="button" class="absolute right-2 top-2.5 rounded p-1 text-amber-300 hover:text-amber-500 transition" aria-label="Fechar" @click="dismissed = true">
      <BaseIcon name="XMark" class="!size-4" />
    </button>

    <!-- Desktop -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pr-6">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2 shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <p class="text-sm text-amber-800">
          Você tem <strong class="font-semibold">{{ count }} escala{{ count !== 1 ? 's' : '' }}</strong> aguardando sua resposta.
        </p>
      </div>
      <router-link to="/my-dashboard" class="shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition">
        Ver agora
      </router-link>
    </div>

    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <span class="relative flex h-2 w-2 shrink-0 mt-1.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <div>
          <p class="text-sm font-semibold text-amber-900">{{ count }} escala{{ count !== 1 ? 's' : '' }} aguardando resposta</p>
          <p class="text-xs text-amber-700 mt-0.5">Você tem escalas pendentes de confirmação.</p>
          <router-link to="/my-dashboard" class="mt-2 inline-flex rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition">
            Ver agora
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'PendingActionsBanner',
  components: { BaseIcon },
  data: () => ({ count: 0, dismissed: false }),
  computed: { authStore: () => useAuthStore() },
  mounted() { this.fetch(); },
  methods: {
    async fetch() {
      if (!this.authStore.user?.id || this.authStore.isOperatorPrivilege) return;
      try { const data = await this.axios.get(`/users/${this.authStore.user.id}/pending_count`); this.count = data.count ?? 0; } catch {}
    }
  }
};
</script>
