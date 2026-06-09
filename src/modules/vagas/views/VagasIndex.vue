<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-slate-800">Vagas</h1>
        <p class="text-xs text-slate-400">Gerencie suas vagas e candidatos</p>
      </div>
      <BaseButton icon="Plus" @click="$router.push('/vagas/nova')">
        Nova vaga
      </BaseButton>
    </div>

    <!-- Card principal -->
    <div class="rounded-xl bg-white p-4 shadow-sm">
      <!-- Tabs de filtro -->
      <div class="mb-4 flex gap-1 rounded-md bg-gray-200/80 p-1 w-fit">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          class="rounded-md px-3 py-2 text-xs font-medium transition-all min-w-24 text-center"
          :class="activeFilter === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
          @click="activeFilter = tab.key"
        >
          {{ tab.label }}
          <span v-if="countByStatus(tab.key) > 0" class="ml-1 rounded px-1.5 py-px text-[10px] bg-gray-200 text-gray-600">
            {{ countByStatus(tab.key) }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <SkeletonRows v-if="loading" :rows="4" has-trailing />

      <!-- Lista de vagas -->
      <div v-else-if="filteredJobs.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
        >
          <!-- Topo do card -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-800">{{ job.title }}</p>
              <p class="mt-0.5 text-xs text-slate-400">{{ job.department || 'Sem área definida' }}</p>
            </div>
            <span :class="statusBadge(job.status).cls" class="inline-flex flex-shrink-0 items-center rounded px-2 py-0.5 text-[11px] font-semibold">
              {{ statusBadge(job.status).label }}
            </span>
          </div>

          <!-- Detalhes -->
          <div class="flex flex-col gap-1.5 text-xs text-slate-500">
            <div class="flex items-center gap-1.5">
              <BaseIcon :name="modalityIcon(job.modality)" class="!size-3.5 flex-shrink-0" />
              <span>{{ modalityLabel(job.modality) }}</span>
              <span v-if="job.locationCity && job.modality !== 'remote'">· {{ job.locationCity }}, {{ job.locationState }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <BaseIcon name="Briefcase" class="!size-3.5 flex-shrink-0" />
              <span>{{ employmentLabel(job.employmentType) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <BaseIcon name="Users" class="!size-3.5 flex-shrink-0" />
              <span>{{ job.applicationsCount || 0 }} candidatos</span>
            </div>
            <div v-if="job.publishedAt" class="flex items-center gap-1.5">
              <BaseIcon name="Clock" class="!size-3.5 flex-shrink-0" />
              <span>Publicada {{ timeAgo(job.publishedAt) }}</span>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex items-center gap-2 border-t border-slate-100 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              @click="$router.push(`/vagas/${job.id}/pipeline`)"
            >
              <BaseIcon name="QueueList" class="!size-3.5" />
              Pipeline
            </button>
            <button
              class="flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              @click="$router.push(`/vagas/${job.id}/editar`)"
            >
              <BaseIcon name="Pencil" class="!size-3.5" />
            </button>
            <button
              v-if="job.status === 'published'"
              class="flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
              @click="closeJob(job)"
            >
              <BaseIcon name="XMark" class="!size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <Empty
        v-else-if="!loading"
        title="Nenhuma vaga encontrada"
        :description="activeFilter === 'all' ? 'Publique sua primeira vaga para começar a receber candidatos.' : 'Nenhuma vaga com esse status no momento.'"
      >
        <BaseButton v-if="activeFilter === 'all'" icon="Plus" @click="$router.push('/vagas/nova')">
          Criar primeira vaga
        </BaseButton>
      </Empty>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import vagasService from '@/services/vagas';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';

export default {
  components: { BaseButton, BaseIcon, Empty, SkeletonRows },

  data() {
    return {
      loading: true,
      jobs: [],
      activeFilter: 'all',
      filterTabs: [
        { key: 'all', label: 'Todas' },
        { key: 'published', label: 'Publicadas' },
        { key: 'draft', label: 'Rascunhos' },
        { key: 'closed', label: 'Encerradas' }
      ]
    };
  },

  computed: {
    breadcrumbStore: () => useBreadcrumbStore(),
    filteredJobs() {
      if (this.activeFilter === 'all') return this.jobs;
      return this.jobs.filter(j => j.status === this.activeFilter);
    }
  },

  async mounted() {
    this.breadcrumbStore.setBreadcrumb([{ name: 'Vagas', path: '/vagas' }]);
    try {
      this.jobs = await vagasService.fetchJobs();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    countByStatus(key) {
      if (key === 'all') return this.jobs.length;
      return this.jobs.filter(j => j.status === key).length;
    },

    statusBadge(status) {
      return {
        draft: { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused: { cls: 'bg-amber-100 text-amber-700', label: 'Pausada' },
        closed: { cls: 'bg-red-100 text-red-600', label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityIcon(modality) {
      return { remote: 'Pin', hybrid: 'Clock', presential: 'Company' }[modality] || 'Pin';
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    },

    employmentLabel(type) {
      return {
        full_time: 'CLT / Integral',
        part_time: 'Meio período',
        internship: 'Estágio',
        freelance: 'Freelance',
        temporary: 'Temporário'
      }[type] || type;
    },

    timeAgo(dateStr) {
      const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
      if (diff === 0) return 'hoje';
      if (diff === 1) return 'há 1 dia';
      if (diff < 30) return `há ${diff} dias`;
      if (diff < 60) return 'há 1 mês';
      return `há ${Math.floor(diff / 30)} meses`;
    },

    async closeJob(job) {
      try {
        await this.axios.put(`/vagas/jobs/${job.id}`, { status: 'closed' });
        job.status = 'closed';
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
