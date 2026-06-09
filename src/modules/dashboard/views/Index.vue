<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-slate-800">Dashboard</h1>
        <p class="text-xs text-slate-400">Visão geral do seu processo seletivo</p>
      </div>
      <BaseButton icon="Plus" @click="$router.push('/vagas/nova')">
        Nova vaga
      </BaseButton>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm"
        :class="kpi.border"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">{{ kpi.label }}</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg" :class="kpi.iconBg">
            <BaseIcon :name="kpi.icon" class="!size-4" :class="kpi.iconColor" />
          </div>
        </div>
        <div>
          <span v-if="!loading" class="text-2xl font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
          <div v-else class="h-7 w-12 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>

    <!-- Funil do pipeline -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-sm font-semibold text-slate-700">Funil de recrutamento</h2>
        <p class="mt-0.5 text-xs text-slate-400">Candidatos por etapa em vagas publicadas</p>
      </div>
      <div class="p-5">
        <div v-if="loading" class="flex items-end gap-3 pt-4">
          <div v-for="i in 4" :key="i" class="flex flex-1 flex-col items-center gap-2">
            <div class="h-2 w-8 animate-pulse rounded bg-slate-100" />
            <div class="w-full animate-pulse rounded-t bg-slate-100" :style="`height:${[60,45,30,20][i-1]}px`" />
            <div class="h-2 w-12 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div v-else-if="funnelStages.length" class="flex items-end gap-2 pt-2">
          <div
            v-for="(stage, idx) in funnelStages"
            :key="stage.name"
            class="flex flex-1 flex-col items-center gap-1.5"
          >
            <span class="text-xs font-bold text-slate-700">{{ stage.count }}</span>
            <div
              class="w-full rounded-t transition-all"
              :style="{ height: funnelHeight(stage.count) + 'px', backgroundColor: stageColor(idx) }"
            />
            <span class="text-center text-[10px] leading-tight text-slate-500">{{ stage.name }}</span>
            <span v-if="funnelPct(idx)" class="text-[10px] font-semibold" :style="{ color: stageColor(idx) }">
              {{ funnelPct(idx) }}%
            </span>
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-3 py-10 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <BaseIcon name="ChartBar" class="!size-6 text-slate-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-600">Nenhum candidato ainda</p>
            <p class="mt-0.5 text-xs text-slate-400">Publique vagas para ver o funil de recrutamento</p>
          </div>
          <BaseButton icon="Plus" @click="$router.push('/vagas/nova')">
            Criar primeira vaga
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Vagas recentes -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 class="text-sm font-semibold text-slate-700">Vagas recentes</h2>
        <router-link to="/vagas" class="text-xs font-medium text-blue-600 transition hover:text-blue-800">Ver todas</router-link>
      </div>

      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-5 py-3.5">
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 w-48 animate-pulse rounded bg-slate-100" />
            <div class="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
          </div>
          <div class="h-5 w-16 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div v-else-if="recentJobs.length" class="divide-y divide-slate-100">
        <router-link
          v-for="job in recentJobs"
          :key="job.id"
          :to="`/vagas/${job.id}/pipeline`"
          class="flex items-center justify-between px-5 py-3.5 transition hover:bg-slate-50"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">{{ job.title }}</p>
            <p class="mt-0.5 text-xs text-slate-400">
              {{ applicationCount(job.id) }} candidato{{ applicationCount(job.id) !== 1 ? 's' : '' }} · {{ modalityLabel(job.modality) }}
              <span v-if="job.department"> · {{ job.department }}</span>
            </p>
          </div>
          <div class="ml-4 flex items-center gap-3">
            <span :class="statusBadge(job.status).cls" class="flex-shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold">
              {{ statusBadge(job.status).label }}
            </span>
            <BaseIcon name="ChevronRight" class="!size-4 flex-shrink-0 text-slate-300" />
          </div>
        </router-link>
      </div>

      <div v-else class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <BaseIcon name="Briefcase" class="!size-6 text-slate-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-slate-600">Nenhuma vaga criada ainda</p>
          <p class="mt-0.5 text-xs text-slate-400">Crie sua primeira vaga e comece a receber candidatos</p>
        </div>
        <BaseButton icon="Plus" @click="$router.push('/vagas/nova')">
          Criar primeira vaga
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import vagasService from '@/services/vagas';

const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default {
  components: { BaseButton, BaseIcon },

  data() {
    return {
      loading: true,
      jobs: [],
      applicationsByJob: {}
    };
  },

  computed: {
    breadcrumbStore: () => useBreadcrumbStore(),

    kpis() {
      const published = this.jobs.filter(j => j.status === 'published').length;
      const draft     = this.jobs.filter(j => j.status === 'draft').length;
      const closed    = this.jobs.filter(j => j.status === 'closed').length;
      const total     = Object.values(this.applicationsByJob).reduce((s, a) => s + a.length, 0);
      return [
        {
          label: 'Vagas publicadas', value: published, icon: 'Briefcase',
          border: 'border-blue-100', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-blue-700'
        },
        {
          label: 'Candidaturas totais', value: total, icon: 'Users',
          border: 'border-purple-100', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', valueColor: 'text-purple-700'
        },
        {
          label: 'Rascunhos', value: draft, icon: 'DocumentText',
          border: 'border-amber-100', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', valueColor: 'text-amber-700'
        },
        {
          label: 'Encerradas', value: closed, icon: 'ArchiveBox',
          border: 'border-slate-200', iconBg: 'bg-slate-50', iconColor: 'text-slate-500', valueColor: 'text-slate-700'
        }
      ];
    },

    recentJobs() {
      return [...this.jobs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    },

    allApplications() {
      return Object.values(this.applicationsByJob).flat();
    },

    funnelStages() {
      if (!this.allApplications.length) return [];
      const counts = {};
      this.allApplications.forEach(a => {
        const stage = a.currentStageName || a.status || 'Triagem';
        counts[stage] = (counts[stage] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }
  },

  async mounted() {
    this.breadcrumbStore.setBreadcrumb([{ name: 'Dashboard', path: '/' }]);
    try {
      this.jobs = await vagasService.fetchJobs();
      const published = this.jobs.filter(j => j.status === 'published');
      const results = await Promise.allSettled(
        published.map(j => vagasService.fetchApplications(j.id).then(apps => ({ jobId: j.id, apps })))
      );
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          this.applicationsByJob[r.value.jobId] = r.value.apps;
        }
      });
    } finally {
      this.loading = false;
    }
  },

  methods: {
    applicationCount(jobId) {
      return (this.applicationsByJob[jobId] || []).length;
    },

    funnelHeight(count) {
      const max = Math.max(...this.funnelStages.map(s => s.count), 1);
      return Math.max(20, Math.round((count / max) * 100));
    },

    funnelPct(idx) {
      if (idx === 0) return null;
      const first = this.funnelStages[0]?.count;
      const curr  = this.funnelStages[idx]?.count;
      if (!first) return null;
      return Math.round((curr / first) * 100);
    },

    stageColor(idx) {
      return FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
    },

    statusBadge(status) {
      return {
        draft:     { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused:    { cls: 'bg-amber-100 text-amber-700', label: 'Pausada' },
        closed:    { cls: 'bg-red-100 text-red-600',     label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    }
  }
};
</script>
