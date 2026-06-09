<template>
  <div
    v-if="store.ready && !store.dismissed && !allDone && !anyDrawerOpen && !sidebarStore.mobileOpen"
    class="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 transition-all"
      :class="minimized ? 'rounded-2xl' : 'rounded-t-2xl'"
      style="background-color: var(--brand-primary)"
    >
      <div class="flex items-center gap-2">
        <BaseIcon name="Rocket" class="!size-4 text-white/80" />
        <span class="text-sm font-semibold text-white">Guia de início rápido</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          :title="minimized ? 'Expandir' : 'Minimizar'"
          @click="minimized = !minimized"
        >
          <BaseIcon :name="minimized ? 'ChevronUp' : 'ChevronDown'" class="!size-3.5" />
        </button>
        <button
          class="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          title="Fechar"
          @click="store.dismiss()"
        >
          <BaseIcon name="XMark" class="!size-3.5" />
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="!minimized" class="px-4 pt-3.5 pb-1">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-gray-500">{{ completedCount }} de {{ totalCount }} concluídos</span>
        <span class="text-xs font-semibold" style="color: var(--brand-primary)">{{ progressPct }}%</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: progressPct + '%', backgroundColor: 'var(--brand-primary)' }"
        />
      </div>
    </div>

    <!-- Steps -->
    <div v-if="!minimized" class="divide-y divide-gray-100 px-2 pb-3 pt-2">
      <!-- Section: Configuração -->
      <div class="pb-1">
        <button
          class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-gray-50 transition-colors"
          @click="section1Open = !section1Open"
        >
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Configure sua conta</span>
          <BaseIcon :name="section1Open ? 'ChevronDown' : 'ChevronRight'" class="!size-3.5 text-gray-400" />
        </button>

        <div v-if="section1Open" class="mt-1 space-y-0.5">
          <!-- Criar conta (always done) -->
          <div class="flex items-center gap-3 rounded-lg px-2 py-2">
            <div
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style="background-color: var(--brand-primary)"
            >
              <BaseIcon name="Check" class="!size-3 text-white" />
            </div>
            <span class="text-sm text-gray-400 line-through">Criar sua conta</span>
          </div>

          <!-- Criar primeira equipe -->
          <router-link
            to="/users?tab=team"
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
          >
            <div
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors"
              :style="store.teamCreated ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}"
            >
              <BaseIcon v-if="store.teamCreated" name="Check" class="!size-3 text-white" />
            </div>
            <span
              class="text-sm transition-colors"
              :class="store.teamCreated ? 'text-gray-400 line-through' : 'text-gray-700'"
            >Criar primeira equipe</span>
          </router-link>

          <!-- Convidar colaborador -->
          <router-link
            to="/users?tab=user"
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
          >
            <div
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors"
              :style="store.memberInvited ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}"
            >
              <BaseIcon v-if="store.memberInvited" name="Check" class="!size-3 text-white" />
            </div>
            <span
              class="text-sm transition-colors"
              :class="store.memberInvited ? 'text-gray-400 line-through' : 'text-gray-700'"
            >Convidar colaborador</span>
          </router-link>
        </div>
      </div>

      <!-- Section: Operação -->
      <div class="pt-1">
        <button
          class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-gray-50 transition-colors"
          @click="section2Open = !section2Open"
        >
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Comece a operar</span>
          <BaseIcon :name="section2Open ? 'ChevronDown' : 'ChevronRight'" class="!size-3.5 text-gray-400" />
        </button>

        <div v-if="section2Open" class="mt-1 space-y-0.5">
          <!-- Criar primeira escala — apenas para módulo Escalas -->
          <router-link
            v-if="hasEscalas"
            to="/calendar/new"
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
          >
            <div
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors"
              :style="store.scheduleCreated ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}"
            >
              <BaseIcon v-if="store.scheduleCreated" name="Check" class="!size-3 text-white" />
            </div>
            <span
              class="text-sm transition-colors"
              :class="store.scheduleCreated ? 'text-gray-400 line-through' : 'text-gray-700'"
            >Criar primeira escala</span>
          </router-link>

          <!-- Criar primeira vaga — apenas para módulo Vagas -->
          <router-link
            v-if="hasVagas"
            to="/vagas/nova"
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
          >
            <div
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors"
              :style="store.vagaCreated ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}"
            >
              <BaseIcon v-if="store.vagaCreated" name="Check" class="!size-3 text-white" />
            </div>
            <span
              class="text-sm transition-colors"
              :class="store.vagaCreated ? 'text-gray-400 line-through' : 'text-gray-700'"
            >Criar primeira vaga</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useOnboardingStore } from '@/components/onboarding/store';
import { useDrawerStore } from '@/components/drawer/store';
import { useSidebarStore } from '@/components/layout/store/sidebar';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: { BaseIcon },

  data() {
    return {
      minimized:    false,
      section1Open: true,
      section2Open: true
    };
  },

  computed: {
    store:       () => useOnboardingStore(),
    drawerStore: () => useDrawerStore(),
    sidebarStore: () => useSidebarStore(),
    authStore:   () => useAuthStore(),

    anyDrawerOpen() {
      return Object.values(this.drawerStore.drawer).some(d => d?.open);
    },

    hasEscalas() {
      const modules = this.authStore.activeModules;
      return !modules?.length || modules.includes('escalas');
    },

    hasVagas() {
      return this.authStore.activeModules?.includes('vagas');
    },

    completedCount() {
      const ops = [];
      if (this.hasEscalas) ops.push(this.store.scheduleCreated);
      if (this.hasVagas)   ops.push(this.store.vagaCreated);
      return 1 + [this.store.teamCreated, this.store.memberInvited, ...ops].filter(Boolean).length;
    },

    totalCount() {
      return 3 + (this.hasEscalas ? 1 : 0) + (this.hasVagas ? 1 : 0);
    },

    allDone() {
      return this.store.teamCreated && this.store.memberInvited &&
        (!this.hasEscalas || this.store.scheduleCreated) &&
        (!this.hasVagas   || this.store.vagaCreated);
    },

    progressPct() {
      return Math.round((this.completedCount / this.totalCount) * 100);
    }
  }
};
</script>
