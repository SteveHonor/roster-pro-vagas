<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-400">Visão geral do seu processo seletivo</p>
      </div>
      <BaseButton icon="Plus" @click="$router.push('/hiring/nova')">
        Nova vaga
      </BaseButton>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="h-2.5 w-24 rounded bg-slate-200" />
            <div class="h-4 w-4 rounded bg-slate-200" />
          </div>
          <div class="mt-3 h-8 w-16 rounded bg-slate-200" />
          <div class="mt-1.5 h-2.5 w-20 rounded bg-slate-200" />
        </div>
      </template>
      <template v-else>
        <div v-for="kpi in kpis" :key="kpi.label" class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-slate-400">{{ kpi.label }}</span>
            <BaseIcon :name="kpi.icon" class="!size-4 text-slate-300" />
          </div>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ kpi.value ?? '—' }}</p>
          <p class="mt-0.5 text-xs text-slate-400">{{ kpi.description }}</p>
        </div>
      </template>
    </div>

    <!-- Funil de recrutamento -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="ChartBar" class="!size-4 text-slate-400" />
        Funil de recrutamento
      </h2>

      <div v-if="loading" class="flex items-end gap-3 pt-2 h-24">
        <div v-for="(h, i) in [80, 60, 38, 18]" :key="i" class="flex flex-1 flex-col items-center gap-1.5">
          <div class="w-full animate-pulse rounded-t bg-slate-200" :style="`height:${h}px`" />
          <div class="h-2 w-10 flex-shrink-0 animate-pulse rounded bg-slate-100" />
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
            class="w-full rounded-t"
            :style="{ height: funnelHeight(stage.count) + 'px', backgroundColor: stageColor(idx) }"
          />
          <span class="text-center text-[10px] leading-tight text-slate-500">{{ stage.name }}</span>
        </div>
      </div>

      <Empty
        v-else
        title="Nenhum candidato ainda"
        description="Publique sua primeira vaga para começar a receber candidatos e ver o funil aqui."
        icon="ChartBar"
        wrapper-class="py-8"
        icon-class="!size-12 text-slate-200"
      >
        <div class="flex flex-col items-center gap-5">
          <button
            class="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            @click="$router.push('/hiring/nova')"
          >
            <BaseIcon name="Plus" class="!size-4" />
            Publicar primeira vaga
          </button>

          <div class="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">1</span>
              Publique a vaga
            </span>
            <span class="text-slate-200">›</span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">2</span>
              Candidatos se inscrevem
            </span>
            <span class="text-slate-200">›</span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">3</span>
              Gerencie o pipeline
            </span>
          </div>
        </div>
      </Empty>
    </div>

    <!-- Vagas recentes -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Briefcase" class="!size-4 text-slate-400" />
        Vagas recentes
        <router-link to="/hiring" class="ml-auto text-xs font-normal text-blue-600 hover:underline">Ver todas</router-link>
      </h2>

      <SkeletonRows v-if="loading" :rows="3" has-trailing />

      <div v-else-if="recentJobs.length" class="flex flex-col gap-2">
        <CardRow
          v-for="job in recentJobs"
          :key="job.id"
          class="cursor-pointer"
          @click="$router.push(`/hiring/${job.id}/pipeline`)"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ job.title }}</p>
            <p class="mt-0.5 text-xs text-slate-400">
              {{ applicationCount(job.id) }} candidato{{ applicationCount(job.id) !== 1 ? 's' : '' }}
              · {{ modalityLabel(job.modality) }}
              <span v-if="job.department"> · {{ job.department }}</span>
            </p>
          </div>
          <template #trailing>
            <span :class="statusBadge(job.status).cls" class="rounded px-2 py-0.5 text-[11px] font-semibold">
              {{ statusBadge(job.status).label }}
            </span>
          </template>
        </CardRow>
      </div>

      <Empty
        v-else
        title="Nenhuma vaga ainda"
        description="Publique vagas, receba candidatos e gerencie o processo seletivo em um só lugar."
        icon="Briefcase"
        wrapper-class="py-6"
        icon-class="!size-10 text-slate-200"
      >
        <button
          class="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          @click="$router.push('/hiring/nova')"
        >
          <BaseIcon name="Plus" class="!size-4" />
          Criar primeira vaga
        </button>
      </Empty>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import vagasService from '@/services/vagas';

const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default {
  components: { BaseButton, BaseIcon, CardRow, Empty, SkeletonRows },

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
        { label: 'Vagas publicadas',    value: published, icon: 'Briefcase',    description: 'Recebendo candidatos' },
        { label: 'Candidaturas totais', value: total,     icon: 'Users',        description: 'Em vagas publicadas' },
        { label: 'Rascunhos',           value: draft,     icon: 'DocumentText', description: 'Aguardando publicação' },
        { label: 'Encerradas',          value: closed,    icon: 'ArchiveBox',   description: 'Processos concluídos' }
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
      return Math.max(20, Math.round((count / max) * 80));
    },

    stageColor(idx) {
      return FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
    },

    statusBadge(status) {
      return {
        draft:     { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused:    { cls: 'bg-amber-100 text-amber-700', label: 'Pausada'   },
        closed:    { cls: 'bg-red-100 text-red-600',     label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    }
  }
};
</script>
