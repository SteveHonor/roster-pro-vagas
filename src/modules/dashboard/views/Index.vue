<template>
  <div class="space-y-6">
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
        class="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ kpi.label }}</span>
          <BaseIcon :name="kpi.icon" class="!size-4 text-slate-400" />
        </div>
        <span v-if="!loading" class="text-2xl font-bold text-slate-800">{{ kpi.value }}</span>
        <div v-else class="h-7 w-12 animate-pulse rounded bg-slate-100" />
      </div>
    </div>

    <!-- Funil do pipeline -->
    <div class="rounded-md border border-slate-200 bg-white p-5">
      <h2 class="mb-4 text-sm font-semibold text-slate-700">Funil de recrutamento</h2>
      <div v-if="loading" class="flex gap-3">
        <div v-for="i in 4" :key="i" class="h-20 flex-1 animate-pulse rounded bg-slate-100" />
      </div>
      <div v-else-if="funnelStages.length" class="flex items-end gap-2">
        <div
          v-for="(stage, idx) in funnelStages"
          :key="stage.name"
          class="flex flex-1 flex-col items-center gap-2"
        >
          <span class="text-xs font-semibold text-slate-700">{{ stage.count }}</span>
          <div
            class="w-full rounded-t"
            :style="{ height: funnelHeight(stage.count) + 'px', backgroundColor: stageColor(idx) }"
          />
          <span class="text-center text-[10px] leading-tight text-slate-500">{{ stage.name }}</span>
        </div>
      </div>
      <div v-else class="flex flex-col items-center gap-2 py-8 text-slate-400">
        <BaseIcon name="ChartBar" class="!size-8" />
        <p class="text-xs">Publique vagas para ver o funil</p>
      </div>
    </div>

    <!-- Vagas recentes -->
    <div class="rounded-md border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 class="text-sm font-semibold text-slate-700">Vagas recentes</h2>
        <router-link to="/vagas" class="text-xs text-blue-600 hover:underline">Ver todas</router-link>
      </div>

      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-5 py-3">
          <div class="h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div class="ml-auto h-4 w-16 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div v-else-if="recentJobs.length" class="divide-y divide-slate-100">
        <router-link
          v-for="job in recentJobs"
          :key="job.id"
          :to="`/vagas/${job.id}/pipeline`"
          class="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-slate-800">{{ job.title }}</p>
            <p class="text-xs text-slate-400">{{ applicationCount(job.id) }} candidatos · {{ modalityLabel(job.modality) }}</p>
          </div>
          <span :class="statusBadge(job.status).cls" class="ml-4 flex-shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold">
            {{ statusBadge(job.status).label }}
          </span>
        </router-link>
      </div>

      <div v-else class="flex flex-col items-center gap-3 py-12 text-center">
        <BaseIcon name="Briefcase" class="!size-8 text-slate-300" />
        <p class="text-sm text-slate-500">Nenhuma vaga criada ainda</p>
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
      const total     = Object.values(this.applicationsByJob).reduce((s, a) => s + a.length, 0);
      return [
        { label: 'Vagas publicadas',    value: published, icon: 'Briefcase' },
        { label: 'Candidaturas totais', value: total,     icon: 'Users' },
        { label: 'Rascunhos',           value: draft,     icon: 'DocumentText' },
        { label: 'Encerradas',          value: this.jobs.filter(j => j.status === 'closed').length, icon: 'ArchiveBox' }
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
      return Math.max(16, Math.round((count / max) * 80));
    },

    stageColor(idx) {
      return FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
    },

    statusBadge(status) {
      return {
        draft:     { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused:    { cls: 'bg-amber-100 text-amber-700', label: 'Pausada' },
        closed:    { cls: 'bg-red-100 text-red-600',    label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    }
  }
};
</script>
