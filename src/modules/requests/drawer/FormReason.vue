<template>
  <Drawer
    context="block-reason"
    :confirm-label="drawerLabels.confirm"
    :cancel-label="drawerLabels.cancel"
    :confirmation="true"
    :exit-button="true"
    :on-cancel="canAct ? declined : null"
    :on-confirm="canAct ? accepted : null"
  >
    <div v-if="block.id" class="space-y-6">

      <!-- Colaborador -->
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
          {{ initials }}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-900">{{ block.user.name }}</p>
            <span :class="originBadge.cls" class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold">
              {{ originBadge.text }}
            </span>
          </div>
          <p v-if="blockStore.positionName" class="text-xs text-gray-500">
            Posição: <span class="font-medium">{{ blockStore.positionName }}</span>
          </p>
          <p class="mt-0.5 text-xs text-gray-400">
            Solicitado em {{ moment(block.createdAt).format('DD/MM/YYYY [às] HH:mm') }}
          </p>
        </div>
      </div>

      <!-- Datas -->
      <div>
        <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {{ datesLabel }}
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(day, idx) in dates"
            :key="idx"
            class="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {{ formatDate(day) }}
          </span>
        </div>
      </div>

      <!-- Justificativa -->
      <div>
        <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Justificativa do colaborador
        </p>
        <div v-if="block.description" class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-sm leading-relaxed text-slate-700">"{{ block.description }}"</p>
        </div>
        <p v-else class="rounded-md border border-dashed border-gray-200 px-4 py-3 text-sm italic text-gray-400">
          Nenhuma justificativa foi informada.
        </p>
      </div>

      <!-- O que acontece com cada decisão — só quando há ação disponível -->
      <div v-if="canAct && block.status === 'pending'" class="rounded-md border border-amber-200 bg-amber-50 p-4">
        <p class="mb-3 text-xs font-semibold text-amber-800">
          O que acontece com cada decisão?
        </p>
        <div class="space-y-2.5">
          <div class="flex items-start gap-2.5">
            <span class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">✓</span>
            <p class="text-xs leading-relaxed text-amber-900">
              <strong>{{ drawerLabels.confirm }}</strong> — {{ decisionBanner.approve }}
            </p>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">✕</span>
            <p class="text-xs leading-relaxed text-amber-900">
              <strong>{{ drawerLabels.cancel }}</strong> — {{ decisionBanner.deny }}
            </p>
          </div>
        </div>
      </div>

      <!-- Leitura somente -->
      <div v-if="!canAct" :class="statusBanner.cls" class="rounded-md px-4 py-3 text-xs font-medium">
        {{ statusBanner.text }}
      </div>

    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import { useAuthStore } from '@/modules/auth/store';
import { useBlockStore } from '@/modules/requests/block';

export default {
  components: { Drawer },

  computed: {
    authStore: () => useAuthStore(),
    blockStore: () => useBlockStore(),

    block() {
      return this.blockStore.block || {};
    },

    isRefuseSchedule() {
      return this.block.origin === 'refuse_schedule';
    },

    dates() {
      try {
        return JSON.parse(this.block.dates || '[]');
      } catch {
        return [];
      }
    },

    datesLabel() {
      const plural = this.dates.length > 1;
      return this.isRefuseSchedule
        ? (plural ? 'Datas da escala recusada' : 'Data da escala recusada')
        : (plural ? 'Datas solicitadas' : 'Data solicitada');
    },

    originBadge() {
      return this.isRefuseSchedule
        ? { cls: 'bg-orange-100 text-orange-700', text: 'Recusa de escala' }
        : { cls: 'bg-blue-100 text-blue-700', text: 'Aviso de ausência' };
    },

    drawerLabels() {
      return this.isRefuseSchedule
        ? { confirm: 'Aprovar ausência', cancel: 'Manter na escala' }
        : { confirm: 'Aprovar', cancel: 'Recusar' };
    },

    decisionBanner() {
      return this.isRefuseSchedule
        ? {
            approve: 'o colaborador fica liberado e a posição ficará vaga. Você precisará encontrar um substituto.',
            deny: 'o pedido é recusado e o colaborador continua escalado para esta data.'
          }
        : {
            approve: 'a ausência é registrada e o colaborador é notificado.',
            deny: 'o pedido é negado e o colaborador é notificado.'
          };
    },

    initials() {
      const name = this.block.user?.name || '';
      return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();
    },

    canAct() {
      return (
        this.block.user?.id !== this.authStore.user?.id &&
        this.$can.canAccess('operator') &&
        this.block.status === 'pending'
      );
    },

    statusBanner() {
      const status = this.block.status;
      const isOwn = this.block.user?.id === this.authStore.user?.id;

      if (status === 'accepted') {
        return {
          cls: 'border border-green-200 bg-green-50 text-green-700',
          text: isOwn
            ? (this.isRefuseSchedule ? 'Sua recusa de escala foi aprovada.' : 'Sua ausência foi aprovada.')
            : (this.isRefuseSchedule ? 'Recusa de escala aprovada.' : 'Ausência aprovada.')
        };
      }
      if (status === 'declined') {
        return {
          cls: 'border border-red-200 bg-red-50 text-red-700',
          text: isOwn
            ? (this.isRefuseSchedule ? 'Sua recusa foi negada. Você continua escalado.' : 'Sua solicitação foi recusada.')
            : (this.isRefuseSchedule ? 'Recusa negada. Colaborador continua escalado.' : 'Solicitação recusada.')
        };
      }
      return {
        cls: 'border border-blue-100 bg-blue-50 text-blue-700',
        text: isOwn
          ? 'Sua solicitação está aguardando análise do responsável pela escala.'
          : 'Aguardando análise.'
      };
    }
  },

  methods: {
    async accepted() {
      try {
        await this.axios.patch(
          `/users/${this.authStore.user.id}/blocks/${this.block.id}/respond`,
          { status: 'accepted' }
        );
        this.blockStore.positionName = '';
        this.drawerStore.onSave('block-reason');
        this.drawerStore.close();
      } catch (error) {
        console.error(error);
      }
    },

    async declined() {
      try {
        await this.axios.patch(
          `/users/${this.authStore.user.id}/blocks/${this.block.id}/respond`,
          { status: 'declined' }
        );
        this.blockStore.positionName = '';
        this.drawerStore.onSave('block-reason');
        this.drawerStore.close();
      } catch (error) {
        console.error(error);
      }
    },

    formatDate(dateStr) {
      return this.moment(dateStr).format('DD/MM/YYYY');
    }
  }
};
</script>
