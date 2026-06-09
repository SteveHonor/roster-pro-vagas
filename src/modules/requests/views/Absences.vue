<template>
  <div class="w-full space-y-4">
    <!-- FILTROS - Admin -->
    <div v-if="!isMemberView" class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <FormSelect v-model="selectedUserId" :options="userFilterOptions" class="w-full md:max-w-full" placeholder="Filtrar por colaborador" />
      <FormSelect v-model="selectedStatus" :options="statusFilterOptions" class="w-full md:max-w-full" placeholder="Filtrar por status" />
      <BaseButton icon="plus" @click="() => $router.push('/requests/calendar')">
        Informar Ausência
      </BaseButton>
    </div>

    <!-- FILTROS - PWA (membro) -->
    <div v-else class="flex gap-2">
      <FormSelect v-model="selectedStatus" :options="statusFilterOptions" class="flex-1" placeholder="Filtrar por status" />
      <BaseButton icon="plus" @click="() => $router.push('/member/requests/calendar')">
        Nova Ausência
      </BaseButton>
    </div>

    <SkeletonRows v-if="loading" :rows="3" has-trailing />

    <template v-else>
      <!-- AUSÊNCIAS -->
      <div v-if="filteredAbsences.length" class="space-y-2">
        <div class="flex items-center gap-2 pb-1">
          <span class="h-2 w-2 rounded-full bg-slate-400"></span>
          <h3 class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ausências</h3>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{{ filteredAbsences.length }}</span>
        </div>

        <CardRow
          v-for="block in filteredAbsences"
          :key="block.id"
          :accent="statusAccent(block.status)"
        >
          <template #prefix>
            <span class="text-sm font-bold text-slate-700">{{ firstDate(block, 'DD') }}</span>
            <span class="text-[9px] uppercase text-slate-400">{{ firstDate(block, 'MMM') }}</span>
          </template>

          <div class="flex items-center gap-1.5">
            <p class="text-sm font-semibold text-slate-800">{{ block.user.name }}</p>
            <span :class="originBadge(block.origin).cls" class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold">
              {{ originBadge(block.origin).text }}
            </span>
          </div>
          <p class="text-xs text-slate-400">{{ datesLabel(block) }}</p>

          <template #trailing>
            <div class="flex items-center gap-2">
              <span :class="['inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold', absenceBadge(block.status).cls]">
                <BaseIcon :name="absenceBadge(block.status).icon" class="!size-3" />
                {{ absenceBadge(block.status).text }}
              </span>
              <button
                class="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                @click="openReason(block)"
              >{{ block.status === 'pending' && $can.canAccess('operator') ? 'Analisar' : 'Ver detalhes' }}</button>
            </div>
          </template>
        </CardRow>
      </div>

      <!-- EMPTY -->
      <div v-if="!filteredAbsences.length">
        <Empty
          :title="isMemberView ? 'Você não tem ausências registradas' : 'Nenhuma ausência encontrada'"
          :description="isMemberView ? 'Precisa faltar ou teve um imprevisto? Toque em &quot;Nova Ausência&quot; para avisar sua equipe.' : 'Clique em &quot;Informar Ausência&quot; para registrar uma nova.'"
        />
      </div>
    </template>

    <FormReason />
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormSelect from '@/components/form/Select.vue';
import FormReason from '@/modules/requests/drawer/FormReason';

import { useAuthStore } from '@/modules/auth/store';
import { useBlockStore } from '@/modules/requests/block';

export default {
  components: { BaseButton, BaseIcon, CardRow, Empty, FormSelect, FormReason, SkeletonRows },

  data() {
    return {
      loading: true,
      selectedUserId: '',
      selectedStatus: ''
    };
  },

  computed: {
    authStore: () => useAuthStore(),
    blockStore: () => useBlockStore(),

    isMemberView() {
      return this.$route.path.startsWith('/member');
    },

    userFilterOptions() {
      const users = this.blockStore.blocks.map(b => b.user);
      const unique = Array.from(new Map(users.map(u => [u.id, u])).values());
      return [
        { label: 'Todos os colaboradores', value: '' },
        ...unique.map(u => ({ label: u.name, value: u.id }))
      ];
    },

    statusFilterOptions() {
      return [
        { label: 'Todas as ausências', value: '' },
        { label: 'Aguardando resposta', value: 'pending' },
        { label: 'Aprovada', value: 'accepted' },
        { label: 'Não aprovada', value: 'declined' }
      ];
    },

    filteredAbsences() {
      return this.blockStore.blocks
        .filter(b => {
          if (b.origin !== 'absence' && b.origin !== 'refuse_schedule') return false;
          return (!this.selectedUserId || b.user.id === this.selectedUserId) &&
            (!this.selectedStatus || b.status === this.selectedStatus);
        })
        .sort((a, b) => {
          const pendingA = a.status === 'pending' ? 0 : 1;
          const pendingB = b.status === 'pending' ? 0 : 1;
          if (pendingA !== pendingB) return pendingA - pendingB;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
    }
  },

  mounted() {
    this.getBlocks();
  },

  methods: {
    statusAccent(status) {
      return {
        pending: 'border-l-2 border-l-amber-400',
        accepted: 'border-l-2 border-l-green-500',
        declined: 'border-l-2 border-l-red-400'
      }[status] || '';
    },

    absenceBadge(status) {
      return {
        pending: { cls: 'bg-amber-50 text-amber-700', icon: 'Clock', text: 'Aguardando resposta' },
        accepted: { cls: 'bg-green-50 text-green-700', icon: 'hand-up', text: 'Aprovada' },
        declined: { cls: 'bg-red-50 text-red-600', icon: 'hand-down', text: 'Não aprovada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', icon: 'Clock', text: status };
    },

    firstDate(block, format) {
      try {
        const dates = JSON.parse(block.dates);
        return dates.length ? this.moment(dates[0]).format(format) : '';
      } catch { return ''; }
    },

    originBadge(origin) {
      return origin === 'refuse_schedule'
        ? { cls: 'bg-orange-100 text-orange-700', text: 'Recusa de escala' }
        : { cls: 'bg-blue-100 text-blue-700', text: 'Aviso de ausência' };
    },

    datesLabel(block) {
      try {
        const dates = JSON.parse(block.dates);
        const n = dates.length;
        if (!n) return '';
        if (n === 1) return this.moment(dates[0]).format('DD/MM/YY');
        return `${n} datas · até ${this.moment(dates[n - 1]).format('DD/MM/YY')}`;
      } catch { return ''; }
    },

    async getBlocks() {
      try {
        const response = await this.axios.get(`users/${this.authStore.user.id}/blocks`);
        this.blockStore.setBlocks(response);
      } finally {
        this.loading = false;
      }
    },

    openReason(block) {
      this.blockStore.setBlock(block);
      if (block.positionName) this.blockStore.positionName = block.positionName;
      const title = block.origin === 'refuse_schedule' ? 'Recusa de Escala' : 'Detalhes da Ausência';
      this.drawerStore.setDrawer({
        title,
        context: 'block-reason',
        open: true,
        onSave: () => this.getBlocks()
      });
    }
  }
};
</script>
