<template>
  <Tab :tabs="filterTabs">
    <template #tabs="{ activeTab }">
      <!-- Filtros + ação -->
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <FormInput
          v-model="searchTerm"
          placeholder="Digite para pesquisar"
          icon="search"
          class="w-full"
        />
        <BaseButton icon="Plus" @click="$router.push('/hiring/nova')">
          Nova vaga
        </BaseButton>
      </div>

      <!-- Loading -->
      <SkeletonRows v-if="loading" :rows="4" has-trailing />

      <!-- Lista -->
      <div v-else-if="filteredJobs(activeTab).length" class="flex flex-col gap-2">
        <CardRow
          v-for="job in filteredJobs(activeTab)"
          :key="job.id"
        >
          <template #prefix>
            <span :class="statusBadge(job.status).dot" class="h-2.5 w-2.5 flex-shrink-0 rounded-full" />
          </template>

          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold text-slate-900">{{ job.title }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="flex items-center gap-1 text-[11px] text-slate-500">
                <BaseIcon :name="modalityIcon(job.modality)" class="!size-3" />
                {{ modalityLabel(job.modality) }}
              </span>
              <span v-if="job.locationCity && job.modality !== 'remote'" class="text-[11px] text-slate-400">
                · {{ job.locationCity }}, {{ job.locationState }}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-slate-500">
                <BaseIcon name="Briefcase" class="!size-3" />
                {{ employmentLabel(job.employmentType) }}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-slate-500">
                <BaseIcon name="Users" class="!size-3" />
                {{ job.applicationsCount || 0 }} candidatos
              </span>
              <span v-if="job.publishedAt" class="flex items-center gap-1 text-[11px] text-slate-400">
                <BaseIcon name="Clock" class="!size-3" />
                {{ timeAgo(job.publishedAt) }}
              </span>
            </div>
          </div>

          <template #trailing>
            <div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <span :class="statusBadge(job.status).cls" class="rounded px-2 py-0.5 text-[11px] font-semibold">
                {{ statusBadge(job.status).label }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                  @click="$router.push(`/hiring/${job.id}/pipeline`)"
                >
                  <BaseIcon name="QueueList" class="!size-3.5" />
                  Pipeline
                </button>
                <button
                  class="inline-flex items-center justify-center rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Editar vaga"
                  @click="$router.push(`/hiring/${job.id}/editar`)"
                >
                  <BaseIcon name="Pencil" class="!size-4" />
                </button>
                <button
                  v-if="job.status === 'published'"
                  class="inline-flex items-center justify-center rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Encerrar vaga"
                  @click="closeJob(job)"
                >
                  <BaseIcon name="XMark" class="!size-4" />
                </button>
              </div>
            </div>
          </template>
        </CardRow>
      </div>

      <!-- Empty -->
      <Empty
        v-else-if="!loading"
        title="Nenhuma vaga encontrada"
        :description="activeTab === 'all' ? 'Publique sua primeira vaga para começar a receber candidatos.' : 'Nenhuma vaga com esse status no momento.'"
      >
        <BaseButton v-if="activeTab === 'all'" icon="Plus" @click="$router.push('/hiring/nova')">
          Criar primeira vaga
        </BaseButton>
      </Empty>
    </template>
  </Tab>
</template>

<script>
import Tab from '@/components/tab/Tab';
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormInput from '@/components/form/Input';
import vagasService from '@/services/vagas';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import { useConfirmationStore } from '@/components/confirmation/store';

export default {
  components: { Tab, BaseButton, BaseIcon, CardRow, Empty, SkeletonRows, FormInput },

  data() {
    return {
      loading: true,
      jobs: [],
      searchTerm: ''
    };
  },

  computed: {
    breadcrumbStore:   () => useBreadcrumbStore(),
    confirmationStore: () => useConfirmationStore(),

    filterTabs() {
      return [
        { key: 'all',       name: 'Todas',      icon: 'Squares',     badge: this.jobs.length || undefined },
        { key: 'published', name: 'Publicadas',  icon: 'CheckCircle', badge: this.countByStatus('published') || undefined },
        { key: 'draft',     name: 'Rascunhos',   icon: 'Pencil',      badge: this.countByStatus('draft') || undefined },
        { key: 'closed',    name: 'Encerradas',  icon: 'ArchiveBox',  badge: this.countByStatus('closed') || undefined }
      ];
    }
  },

  async mounted() {
    this.breadcrumbStore.setBreadcrumb([{ name: 'Vagas', path: '/hiring' }]);
    try {
      this.jobs = await vagasService.fetchJobs();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    countByStatus(key) {
      return this.jobs.filter(j => j.status === key).length;
    },

    filteredJobs(tab) {
      let list = tab === 'all' ? this.jobs : this.jobs.filter(j => j.status === tab);
      if (this.searchTerm) {
        const q = this.searchTerm.toLowerCase();
        list = list.filter(j => j.title?.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q));
      }
      return list;
    },

    statusBadge(status) {
      return {
        draft:     { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho',  dot: 'bg-slate-300' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada', dot: 'bg-green-500' },
        paused:    { cls: 'bg-amber-100 text-amber-700', label: 'Pausada',   dot: 'bg-amber-400' },
        closed:    { cls: 'bg-red-100 text-red-600',     label: 'Encerrada', dot: 'bg-red-400'   }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status, dot: 'bg-slate-300' };
    },

    modalityIcon(modality) {
      return { remote: 'Pin', hybrid: 'Clock', presential: 'Company' }[modality] || 'Pin';
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    },

    employmentLabel(type) {
      return {
        full_time:  'CLT / Integral',
        pj:         'Pessoa Jurídica',
        part_time:  'Meio período',
        internship: 'Estágio',
        freelance:  'Freelance',
        temporary:  'Temporário'
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

    closeJob(job) {
      this.confirmationStore.setConfirmation({
        title:       'Encerrar vaga?',
        description: `A vaga "${job.title}" será encerrada e não aceitará novos candidatos. Candidaturas existentes são preservadas.`,
        open:        true,
        confirmText: 'Encerrar vaga',
        onConfirm:   async () => {
          try {
            await this.axios.delete(`/hiring/jobs/${job.id}`);
            job.status = 'closed';
          } catch (error) {
            console.error(error);
          }
        },
        onCancel: () => this.confirmationStore.close()
      });
    }
  }
};
</script>
