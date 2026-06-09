<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Relatório Mensal</h1>
        <p class="text-sm text-slate-400">Visão consolidada da operação no período</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          @click="prevMonth"
        >
          <BaseIcon name="ChevronLeft" class="!h-4 !w-4" />
        </button>
        <div class="flex h-9 min-w-[140px] items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 capitalize">
          {{ periodLabel }}
        </div>
        <button
          :disabled="isCurrentMonth"
          class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          @click="nextMonth"
        >
          <BaseIcon name="ChevronRight" class="!h-4 !w-4" />
        </button>
      </div>
    </div>

    <!-- Upsell locked -->
    <div v-if="locked" class="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
        <BaseIcon name="DocumentText" class="!h-7 !w-7 text-orange-500" />
      </div>
      <h2 class="text-lg font-bold text-slate-800">Relatórios mensais disponíveis no plano Pro</h2>
      <p class="mt-1 max-w-sm text-sm text-slate-500">
        Veja escalas, trocas, ausências, feedbacks e engajamento do time em um só lugar — por mês.
      </p>
      <div class="mt-4 grid max-w-sm grid-cols-2 gap-2 text-left text-xs text-slate-500">
        <div class="flex items-center gap-1.5"><BaseIcon name="Check" class="!h-3.5 !w-3.5 text-orange-500" /> Taxa de ocupação das escalas</div>
        <div class="flex items-center gap-1.5"><BaseIcon name="Check" class="!h-3.5 !w-3.5 text-orange-500" /> Ranking de faltas e ausências</div>
        <div class="flex items-center gap-1.5"><BaseIcon name="Check" class="!h-3.5 !w-3.5 text-orange-500" /> Avaliações e top performers</div>
        <div class="flex items-center gap-1.5"><BaseIcon name="Check" class="!h-3.5 !w-3.5 text-orange-500" /> Engajamento e tempo de resposta</div>
      </div>
      <button class="mt-6 rounded-md bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600" @click="openUpgrade">
        Ver planos
      </button>
    </div>

    <!-- Skeleton loading -->
    <template v-else-if="loading">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="i in 6" :key="i" class="animate-pulse rounded-md border border-slate-100 bg-slate-50 p-4">
          <div class="h-2.5 w-16 rounded bg-slate-200" />
          <div class="mt-3 h-7 w-12 rounded bg-slate-200" />
          <div class="mt-1.5 h-2 w-20 rounded bg-slate-200" />
        </div>
      </div>
      <div v-for="s in 3" :key="s" class="rounded-md border border-slate-100 bg-white p-5">
        <div class="animate-pulse space-y-3">
          <div class="flex items-center gap-2">
            <div class="h-5 w-5 rounded bg-slate-200" />
            <div class="h-4 w-32 rounded bg-slate-200" />
          </div>
          <SkeletonRows :rows="3" />
        </div>
      </div>
    </template>

    <!-- Dados carregados -->
    <template v-else-if="hasData">

      <!-- Summary cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Eventos</p>
          <p class="mt-1 text-2xl font-bold text-slate-800">{{ report.summary.totalEvents }}</p>
          <p class="text-xs text-slate-400">no mês</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Ocupação</p>
          <p class="mt-1 text-2xl font-bold" :class="fillRateColor">{{ fillRatePct }}%</p>
          <p class="text-xs text-slate-400">de confirmação</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Rating médio</p>
          <p class="mt-1 text-2xl font-bold text-slate-800">{{ report.summary.avgRating || '—' }}</p>
          <p class="text-xs text-slate-400">avaliações</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Trocas</p>
          <p class="mt-1 text-2xl font-bold text-slate-800">{{ report.summary.totalSwaps }}</p>
          <p class="text-xs text-slate-400">solicitadas</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Ausências</p>
          <p class="mt-1 text-2xl font-bold text-slate-800">{{ report.summary.totalBlocks }}</p>
          <p class="text-xs text-slate-400">solicitadas</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-white p-4">
          <p class="text-xs text-slate-400">Engajamento</p>
          <p class="mt-1 text-2xl font-bold" :class="engagementColor">{{ engagementPct }}%</p>
          <p class="text-xs text-slate-400">responderam</p>
        </div>
      </div>

      <!-- Escalas e Atendimentos -->
      <div class="rounded-md border border-slate-100 bg-white p-5">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BaseIcon name="Calendar" class="!h-4 !w-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-700">Escalas e Atendimentos</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Total de vagas</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.schedules.totalSlots }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Confirmados</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ report.schedules.accepted }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Recusados</p>
            <p class="mt-1 text-xl font-bold text-red-500">{{ report.schedules.declined }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Pendentes</p>
            <p class="mt-1 text-xl font-bold text-amber-500">{{ report.schedules.pending }}</p>
          </div>
        </div>
        <div v-if="report.schedules.byTeam && report.schedules.byTeam.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Por equipe</p>
          <div class="space-y-2">
            <div
              v-for="team in report.schedules.byTeam"
              :key="team.teamId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2.5"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-700">{{ team.teamName }}</p>
                <p class="text-xs text-slate-400">{{ team.total }} vagas</p>
              </div>
              <div class="flex shrink-0 items-center gap-4 text-xs">
                <span class="font-medium text-emerald-600">{{ team.accepted }} ✓</span>
                <span class="font-medium text-red-500">{{ team.declined }} ✗</span>
                <span class="font-medium text-amber-500">{{ team.pending }} pendente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trocas de Escala -->
      <div class="rounded-md border border-slate-100 bg-white p-5">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BaseIcon name="ArrowPath" class="!h-4 !w-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-700">Trocas de Escala</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Solicitadas</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.swaps.total }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Aprovadas</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ report.swaps.approved }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Rejeitadas</p>
            <p class="mt-1 text-xl font-bold text-red-500">{{ report.swaps.rejected }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Pendentes</p>
            <p class="mt-1 text-xl font-bold text-amber-500">{{ report.swaps.pending }}</p>
          </div>
        </div>
        <div v-if="report.swaps.topRequesters && report.swaps.topRequesters.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Mais solicitaram trocas</p>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in report.swaps.topRequesters"
              :key="r.userId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <span class="w-5 text-center text-xs font-bold text-slate-400">{{ i + 1 }}</span>
              <p class="flex-1 truncate text-sm text-slate-700">{{ r.name }}</p>
              <span class="text-xs font-semibold text-slate-500">{{ r.count }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ausências e Bloqueios -->
      <div class="rounded-md border border-slate-100 bg-white p-5">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BaseIcon name="Block" class="!h-4 !w-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-700">Ausências e Bloqueios</h2>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Aprovadas</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ report.blocks.approved }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Recusadas</p>
            <p class="mt-1 text-xl font-bold text-red-500">{{ report.blocks.rejected }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Pendentes</p>
            <p class="mt-1 text-xl font-bold text-amber-500">{{ report.blocks.pending }}</p>
          </div>
        </div>
        <div v-if="report.blocks.topAbsent && report.blocks.topAbsent.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Mais ausências aprovadas</p>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in report.blocks.topAbsent"
              :key="r.userId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <span class="w-5 text-center text-xs font-bold text-slate-400">{{ i + 1 }}</span>
              <p class="flex-1 truncate text-sm text-slate-700">{{ r.name }}</p>
              <span class="text-xs font-semibold text-slate-500">{{ r.count }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedbacks e Avaliações -->
      <div class="rounded-md border border-slate-100 bg-white p-5">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BaseIcon name="Star" class="!h-4 !w-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-700">Feedbacks e Avaliações</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Total</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.feedbacks.total }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Rating médio</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.feedbacks.avgRating || '—' }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="mb-2 text-xs text-slate-400">Distribuição</p>
            <div class="space-y-1">
              <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center gap-2">
                <span class="w-3 text-xs text-slate-400">{{ star }}</span>
                <div class="flex-1 overflow-hidden rounded-full bg-slate-200" style="height:5px">
                  <div class="h-full rounded-full bg-blue-500" :style="{ width: distributionWidth(star) }" />
                </div>
                <span class="w-5 text-right text-xs text-slate-500">{{ report.feedbacks.distribution[star] || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="report.feedbacks.topRated && report.feedbacks.topRated.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Top performers</p>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in report.feedbacks.topRated"
              :key="r.userId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <span class="w-5 text-center text-xs font-bold text-slate-400">{{ i + 1 }}</span>
              <p class="flex-1 truncate text-sm text-slate-700">{{ r.name }}</p>
              <RatingStars :rating="r.avgRating" mode="numeric" />
              <span class="text-xs text-slate-400">{{ r.count }} avaliações</span>
            </div>
          </div>
        </div>
        <div v-if="report.feedbacks.byTeam && report.feedbacks.byTeam.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Por equipe</p>
          <div class="space-y-1.5">
            <div
              v-for="team in report.feedbacks.byTeam"
              :key="team.teamId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <p class="flex-1 truncate text-sm text-slate-700">{{ team.teamName }}</p>
              <span class="text-xs text-slate-400">{{ team.count }} avaliações</span>
              <RatingStars :rating="team.avgRating" mode="numeric" />
            </div>
          </div>
        </div>
      </div>

      <!-- Engajamento do Time -->
      <div class="rounded-md border border-slate-100 bg-white p-5">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BaseIcon name="CursorArrowRays" class="!h-4 !w-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-700">Engajamento do Time</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Escalas</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.engagement.totalItems }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Responderam</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ report.engagement.responded }}</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Taxa</p>
            <p class="mt-1 text-xl font-bold" :class="engagementColor">{{ engagementPct }}%</p>
          </div>
          <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs text-slate-400">Tempo médio</p>
            <p class="mt-1 text-xl font-bold text-slate-800">{{ report.engagement.avgResponseHours ? report.engagement.avgResponseHours + 'h' : '—' }}</p>
          </div>
        </div>
        <div v-if="report.engagement.topEngaged && report.engagement.topEngaged.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Mais engajados (resposta mais rápida)</p>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in report.engagement.topEngaged"
              :key="r.userId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <span class="w-5 text-center text-xs font-bold text-slate-400">{{ i + 1 }}</span>
              <p class="flex-1 truncate text-sm text-slate-700">{{ r.name }}</p>
              <span class="text-xs text-slate-500">~{{ r.avgResponseHours }}h</span>
            </div>
          </div>
        </div>
        <div v-if="report.engagement.leastEngaged && report.engagement.leastEngaged.length" class="mt-4">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Menos engajados</p>
          <div class="space-y-1.5">
            <div
              v-for="r in report.engagement.leastEngaged"
              :key="r.userId"
              class="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-2"
            >
              <p class="flex-1 truncate text-sm text-slate-700">{{ r.name }}</p>
              <span v-if="r.noResponses > 0" class="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">
                {{ r.noResponses }} sem resposta
              </span>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- Sem dados -->
    <div
      v-else-if="!loading && !locked && !hasData"
      class="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-200 bg-white py-16 text-center"
    >
      <BaseIcon name="Calendar" class="!h-8 !w-8 text-slate-200" />
      <div>
        <p class="text-sm font-medium text-slate-500">Nenhuma movimentação em {{ periodLabel }}</p>
        <p class="mt-0.5 text-xs text-slate-400">
          {{ isCurrentMonth ? 'O mês ainda está em andamento — os dados aparecerão conforme as escalas forem criadas.' : 'Não há escalas, trocas ou ausências registradas neste período.' }}
        </p>
      </div>
      <button
        v-if="isCurrentMonth"
        class="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        @click="prevMonth"
      >
        Ver mês anterior
        <BaseIcon name="ChevronRight" class="!h-3.5 !w-3.5" />
      </button>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import RatingStars from '@/components/rating/Star';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'ReportsIndex',
  components: { BaseIcon, SkeletonRows, RatingStars },

  data() {
    const now = new Date();
    return {
      year:    now.getFullYear(),
      month:   now.getMonth() + 1,
      report:  null,
      loading: false,
      locked:  false
    };
  },

  computed: {
    planStore: () => usePlanStore(),

    periodLabel() {
      return new Date(this.year, this.month - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    },

    isCurrentMonth() {
      const now = new Date();
      return this.year === now.getFullYear() && this.month === (now.getMonth() + 1);
    },

    fillRatePct() {
      return Math.round((this.report?.summary?.fillRate || 0) * 100);
    },

    fillRateColor() {
      const p = this.fillRatePct;
      if (p >= 80) return 'text-emerald-600';
      if (p >= 50) return 'text-amber-500';
      return 'text-red-500';
    },

    engagementPct() {
      return Math.round((this.report?.summary?.engagementRate || 0) * 100);
    },

    engagementColor() {
      const p = this.engagementPct;
      if (p >= 80) return 'text-emerald-600';
      if (p >= 50) return 'text-amber-500';
      return 'text-red-500';
    },

    hasData() {
      if (!this.report) return false;
      const s = this.report.summary;
      return s.totalEvents > 0 || s.totalScheduleItems > 0 || s.totalSwaps > 0 || s.totalBlocks > 0;
    }
  },

  mounted() {
    this.fetch();
  },

  methods: {
    async fetch() {
      this.loading = true;
      this.locked  = false;
      this.report  = null;

      try {
        this.report = await this.axios.get('/reports/monthly', {
          params: { year: this.year, month: this.month }
        });
      } catch (err) {
        if (err?.response?.status === 402) {
          this.locked = true;
        }
      } finally {
        this.loading = false;
      }
    },

    prevMonth() {
      if (this.month === 1) { this.year--; this.month = 12; }
      else { this.month--; }
      this.fetch();
    },

    nextMonth() {
      if (this.isCurrentMonth) return;
      if (this.month === 12) { this.year++; this.month = 1; }
      else { this.month++; }
      this.fetch();
    },

    openUpgrade() {
      this.planStore.setOpen('upgrade');
    },

    distributionWidth(star) {
      const dist = this.report.feedbacks.distribution;
      const max = Math.max(...Object.values(dist), 1);
      const val = dist[star] || 0;
      return `${Math.round((val / max) * 100)}%`;
    }
  }
};
</script>
