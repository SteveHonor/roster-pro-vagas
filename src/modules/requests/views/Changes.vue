<template>
  <SkeletonRows v-if="loading" :rows="3" />

  <div v-else-if="changes.length" class="space-y-3">
    <div
      v-for="change in changes"
      :key="change.id ?? change.candidateId"
      class="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-sm"
    >
      <!-- Cabeçalho: solicitante + data -->
      <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <div class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
            {{ change.requester?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <span class="text-sm font-medium text-gray-700">{{ change.requester?.name }}</span>
          <span class="text-xs text-gray-400">solicitou uma troca</span>
        </div>
        <span
          v-if="isOperator"
          class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          :class="changeBadgeClass(change.status)"
        >
          {{ changeBadgeLabel(change.status) }}
        </span>
      </div>

      <div class="flex flex-wrap items-start justify-between gap-4 px-4 py-3">
        <!-- Info do evento -->
        <div class="flex items-center gap-3">
          <div class="flex w-10 flex-shrink-0 flex-col items-center justify-center rounded-md border border-slate-200 bg-white py-1.5 text-center shadow-sm">
            <span class="text-base font-bold leading-none text-slate-900">
              {{ moment(change.event?.date).format('DD') }}
            </span>
            <span class="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {{ moment(change.event?.date).format('MMM') }}
            </span>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ change.event?.name }}</p>
            <p v-if="change.event?.period?.start" class="text-xs text-gray-500">
              {{ change.event.period.start }} – {{ change.event.period.end }}
            </p>
            <p v-if="change.position" class="text-xs font-medium text-gray-400">{{ change.position?.name }}</p>
          </div>
        </div>

        <!-- Candidatos (visão admin/operator) -->
        <div v-if="isOperator" class="min-w-0 flex-1">
          <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Candidatos</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in change.candidates"
              :key="c.id"
              class="rounded-md px-2 py-0.5 text-xs font-medium"
              :class="candidateBadgeClass(c.status)"
            >
              {{ c.name }}
            </span>
          </div>
        </div>

        <!-- Ações admin/operator: só para pending_admin -->
        <div v-if="isOperator && change.status === 'pending_admin'" class="flex flex-shrink-0 gap-2">
          <button
            class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            @click="rejectChange(change.id)"
          >
            Recusar
          </button>
          <button
            class="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            :style="{ background: 'var(--brand-primary)' }"
            @click="approveChange(change.id)"
          >
            Aprovar
          </button>
        </div>

        <!-- Ações colaborador: aceitar ou recusar o convite -->
        <div v-else-if="!isOperator && change.status === 'pending'" class="flex flex-shrink-0 gap-2">
          <button
            class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            @click="reject(change.candidateId)"
          >
            Recusar
          </button>
          <button
            class="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            :style="{ background: 'var(--brand-primary)' }"
            @click="accept(change.candidateId)"
          >
            Aceitar
          </button>
        </div>

        <!-- Status final colaborador -->
        <div v-else-if="!isOperator" class="flex items-center gap-1.5 text-xs font-medium" :class="statusTextClass(change.status)">
          <BaseIcon :name="statusIcon(change.status)" class="!size-4" />
          {{ statusLabel(change.status) }}
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!loading">
    <Empty
      title="Nenhuma troca em andamento"
      description="Quando você ou um colega solicitar uma troca de escala, ela aparecerá aqui."
    />
  </div>
</template>

<script>
import Empty from '@/components/empty/Empty';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: { Empty, BaseIcon, SkeletonRows },

  data() {
    return {
      loading: true,
      changes: []
    };
  },

  computed: {
    authStore: () => useAuthStore(),
    isOperator() {
      return this.$can.canAccess('operator');
    }
  },

  mounted() {
    this.fetch();
  },

  methods: {
    async fetch() {
      this.loading = true;
      try {
        const endpoint = this.isOperator ? '/schedule_changes' : '/schedule_change_candidates';
        this.changes = await this.axios.get(endpoint);
      } finally {
        this.loading = false;
      }
    },

    // Admin/operator: aprovar a solicitação → notifica candidatos
    async approveChange(changeId) {
      try {
        await this.axios.put(`/schedule_changes/${changeId}/approve`);
        this.fetch();
      } catch {
        this.fetch();
      }
    },

    // Admin/operator: recusar a solicitação
    async rejectChange(changeId) {
      try {
        await this.axios.put(`/schedule_changes/${changeId}/reject`);
        this.fetch();
      } catch {
        this.fetch();
      }
    },

    // Colaborador: aceitar convite de troca
    async accept(candidateId) {
      try {
        await this.axios.put(`/schedule_change_candidates/${candidateId}/accept`);
        this.fetch();
      } catch {
        this.fetch();
      }
    },

    // Colaborador: recusar convite de troca
    async reject(candidateId) {
      try {
        await this.axios.put(`/schedule_change_candidates/${candidateId}/reject`);
        this.fetch();
      } catch {
        this.fetch();
      }
    },

    changeBadgeClass(status) {
      return {
        pending_admin:      'bg-amber-100 text-amber-700',
        approved_by_admin:  'bg-blue-100 text-blue-700',
        rejected_by_admin:  'bg-red-100 text-red-600',
        accepted:           'bg-green-100 text-green-700',
        cancelled:          'bg-slate-100 text-slate-500'
      }[status] || 'bg-slate-100 text-slate-500';
    },

    changeBadgeLabel(status) {
      return {
        pending_admin:      'Aguardando aprovação',
        approved_by_admin:  'Aprovada — aguardando candidatos',
        rejected_by_admin:  'Recusada',
        accepted:           'Troca concluída',
        cancelled:          'Cancelada'
      }[status] || status;
    },

    candidateBadgeClass(status) {
      return {
        pending:  'bg-slate-100 text-slate-600',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-600',
        locked:   'bg-gray-100 text-gray-400 line-through'
      }[status] || 'bg-slate-100 text-slate-600';
    },

    statusIcon(status) {
      return { accepted: 'Check', rejected: 'XMark', locked: 'ArrowPath' }[status] || 'Clock';
    },

    statusTextClass(status) {
      return {
        accepted: 'text-green-600',
        rejected: 'text-red-500',
        locked:   'text-gray-400'
      }[status] || 'text-amber-600';
    },

    statusLabel(status) {
      return {
        accepted: 'Você aceitou a troca',
        rejected: 'Você recusou',
        locked:   'Outro colaborador aceitou primeiro'
      }[status] || 'Aguardando sua resposta';
    }
  }
};
</script>
