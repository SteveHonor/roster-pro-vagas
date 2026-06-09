<template>
  <ul
    class="mt-16 space-y-1 font-light"
    :class="
      sidebarStore.collapsed
        ? 'flex flex-wrap items-center justify-center px-0 text-center'
        : 'px-8 md:px-0'
    "
  >
    <li
      v-for="item in menu"
      :key="item.to"
      class="rounded-lg hover:bg-gray-50"
    >
      <router-link
        v-if="$can.canView('dashboard') && $can.canAccess(item?.role)"
        :to="item.to"
        class="group flex items-center rounded-lg px-2 py-2"
        :class="
          sidebarStore.collapsed
            ? 'w-16 justify-center'
            : 'w-full space-x-4 md:space-x-4'
        "
      >
        <BaseIcon :name="item.icon" class="h-5 w-5 flex-shrink-0" />

        <div v-if="!sidebarStore.collapsed" class="text-left">
          <div class="text-sm">{{ item.title }}</div>
          <div v-if="item.subtitle" class="text-xs text-gray-500">
            {{ item.subtitle }}
          </div>
        </div>
      </router-link>
    </li>
  </ul>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useSidebarStore } from '@/components/layout/store/sidebar';

export default {
  components: { BaseIcon },

  computed: {
    sidebarStore: () => useSidebarStore(),
    menu() {
      const isOperator = this.$can.canAccess('operator');
      return [
        {
          to: isOperator ? '/' : '/my-dashboard',
          icon: 'dashboard',
          title: 'Dashboard',
          subtitle: isOperator ? 'Resumo | Métricas' : 'Início',
          role: 'user'
        },
        {
          to: '/calendar',
          icon: 'calendar',
          title: 'Calendário',
          subtitle: 'Escalas e Agendas',
          role: 'user'
        },
        {
          to: '/requests',
          icon: 'block',
          title: 'Solicitações',
          subtitle: 'Ausências e Trocas',
          role: 'user'
        },
        {
          to: '/evaluations',
          icon: 'chart-bar',
          title: 'Avaliações',
          subtitle: 'Desempenho',
          role: 'user'
        },
        {
          to: '/vagas',
          icon: 'briefcase',
          title: 'Vagas',
          subtitle: 'Recrutamento',
          role: 'operator'
        },
        {
          to: '/reports',
          icon: 'document-text',
          title: 'Relatórios',
          subtitle: 'Resumo mensal',
          role: 'operator'
        },
        {
          to: '/users',
          icon: 'users',
          title: 'Cadastros',
          subtitle: 'Equipes e Colaboradores',
          role: 'user'
        },
        {
          to: '/settings',
          icon: 'tool',
          title: 'Configurações',
          role: 'user'
        }
      ];
    }
  }
};
</script>

<style scoped>
.active {
  font-weight: 600;
  color: var(--brand-primary, #2563eb);
}
</style>
